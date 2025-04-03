from prisma import Prisma

# Same prisma client gets used in instance
prisma_client = Prisma(auto_register=True)

async def connect_db():
    """Connect to the database."""
    await prisma_client.connect()

async def disconnect_db():
    """Disconnect from the database."""
    if prisma_client.is_connected():
        await prisma_client.disconnect()