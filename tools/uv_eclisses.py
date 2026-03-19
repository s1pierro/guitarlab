"""
uv_eclisses.py
Génère des UV cylindriques pour guitar.body dans gao-beta-6.obj
U = angle autour de l'axe Y (atan2 Z/X), V = hauteur normalisée Y
"""

import math
import shutil
from pathlib import Path

OBJ_IN  = Path('../guitars/gao-beta-6.obj')
OBJ_OUT = Path('../guitars/gao-beta-6.obj')
TARGET  = 'guitar.body'

# --- lecture ---
lines = OBJ_IN.read_text().splitlines()

# Collecter tous les vertices globaux (1-indexed)
verts = []  # (x, y, z)
for l in lines:
    if l.startswith('v '):
        x, y, z = map(float, l.split()[1:4])
        verts.append((x, y, z))

# Trouver les vertex indices utilisés par TARGET
in_target = False
body_vi = set()
for l in lines:
    if l.startswith('o '):
        in_target = (l.split()[1] == TARGET)
    if in_target and l.startswith('f '):
        for tok in l.split()[1:]:
            vi = int(tok.split('/')[0]) - 1  # 0-indexed
            body_vi.add(vi)

# Bornes Y pour normalisation
ys = [verts[i][1] for i in body_vi]
y_min, y_max = min(ys), max(ys)
y_range = y_max - y_min or 1.0

# Calculer UV cylindrique pour chaque vertex du body
# U = atan2(z, x) ramené dans [0, 1]
# V = (y - y_min) / y_range
body_uv = {}  # vi (0-indexed) -> (u, v)
for i in body_vi:
    x, y, z = verts[i]
    u = (math.atan2(z, x) / (2 * math.pi)) % 1.0
    v = (y - y_min) / y_range
    body_uv[i] = (u, v)

# --- reconstruction du fichier ---
# On va insérer les vt et réécrire les faces de guitar.body

existing_vt_count = sum(1 for l in lines if l.startswith('vt '))
# Index de départ pour les nouveaux vt (1-indexed dans OBJ)
new_vt_start = existing_vt_count + 1

# Mapping vi -> vt index (1-indexed)
vi_to_vt = {}
new_vt_lines = []
for idx, (vi, (u, v)) in enumerate(body_uv.items()):
    vi_to_vt[vi] = new_vt_start + idx
    new_vt_lines.append(f'vt {u:.6f} {v:.6f}')

# Réécrire
out = []
in_target = False
vt_inserted = False

for l in lines:
    if l.startswith('o '):
        cur_obj = l.split()[1]
        in_target = (cur_obj == TARGET)
        # Insérer les vt juste avant la section guitar.body
        if in_target and not vt_inserted:
            out.extend(new_vt_lines)
            vt_inserted = True
        out.append(l)
        continue

    if in_target and l.startswith('f '):
        # Réécrire chaque face avec vi/vt/vn ou vi/vt
        tokens = l.split()
        new_tokens = ['f']
        for tok in tokens[1:]:
            parts = tok.split('/')
            vi = int(parts[0]) - 1  # 0-indexed
            vt_i = vi_to_vt.get(vi, 1)
            if len(parts) == 3:
                new_tokens.append(f'{parts[0]}/{vt_i}/{parts[2]}')
            elif len(parts) == 2:
                new_tokens.append(f'{parts[0]}/{vt_i}')
            else:
                new_tokens.append(f'{parts[0]}/{vt_i}')
        out.append(' '.join(new_tokens))
        continue

    out.append(l)

# Backup + écriture
shutil.copy(OBJ_IN, OBJ_IN.with_suffix('.obj.bak'))
OBJ_OUT.write_text('\n'.join(out) + '\n')
print(f"Done — {len(new_vt_lines)} UV coords ajoutés pour {TARGET}")
print(f"Backup : {OBJ_IN.with_suffix('.obj.bak')}")
