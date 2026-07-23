import json, sys
from collections import Counter

data = json.load(open(sys.argv[1]))
plan = data["plan"]
ops = plan["operations"]

print("Target:", plan["targetRoot"])
print("Mode:", plan["mode"])
print("Languages:", plan["languages"])
print("Total operations:", len(ops))

dirs = Counter()
for op in ops:
    d = op["destinationPath"].replace("\\\\", "/").replace("\\", "/")
    if "rules/ecc/" in d:
        key = d.split("rules/ecc/")[1].split("/")[0]
    elif "skills/ecc/" in d:
        key = "skills-" + d.split("skills/ecc/")[1].split("/")[0]
    else:
        key = "other"
    dirs[key] += 1

print()
for d, c in sorted(dirs.items()):
    print(f"  {d}: {c}")

print()
print("Sample ops:")
for op in ops[:3]:
    print(f"  {op['kind']}: {op['sourceRelativePath']}")

print()
print("Warnings:", plan.get("warnings", []))
