import os
import shutil
import re

base_dir = r"Q:\Tikitaka\src\app\ordina"
app_dir = r"Q:\Tikitaka\src\app"

# Create new directory structure
os.makedirs(os.path.join(base_dir, "[siteId]", "[slotId]", "[date]"), exist_ok=True)

# Move pranzo, riepilogo, pagamento to new location
old_pranzo = os.path.join(base_dir, "pranzo_temp")
old_riepilogo = os.path.join(base_dir, "riepilogo_temp")
old_pagamento = os.path.join(base_dir, "pagamento_temp")

new_date_dir = os.path.join(base_dir, "[siteId]", "[slotId]", "[date]")

if os.path.exists(old_pranzo):
    shutil.move(old_pranzo, os.path.join(new_date_dir, "pranzo"))
if os.path.exists(old_riepilogo):
    shutil.move(old_riepilogo, os.path.join(new_date_dir, "riepilogo"))
if os.path.exists(old_pagamento):
    shutil.move(old_pagamento, os.path.join(new_date_dir, "pagamento"))

date_dir_to_remove = os.path.join(base_dir, "[date]")
if os.path.exists(date_dir_to_remove):
    shutil.rmtree(date_dir_to_remove)

print("Directories restructured.")
