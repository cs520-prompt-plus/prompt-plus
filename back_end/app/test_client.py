try:
    from prisma import Prisma
    print("Import successful!")
except Exception as e:
    print(f"Import failed: {e}")