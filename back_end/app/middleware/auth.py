from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import os
import json
from typing import Any
from Crypto.Protocol.KDF import HKDF # pip install pycryptodome
from Crypto.Hash import SHA256 
from jose import jwe # pip install python-jose
from app.client import prisma_client as prisma
import os

def getDerivedEncryptionKey(secret: str) -> Any:
    # Think about including the context in your environment variables.
    context = str.encode("NextAuth.js Generated Encryption Key") 
    return HKDF(
        master=secret.encode(),
        key_len=32,
        salt="".encode(),
        hashmod=SHA256,
        num_keys=1,
        context=context,
    )


def get_token(token: str) -> dict[str, Any]:
    '''
    Get the JWE payload from a NextAuth.js JWT/JWE token in Python

    Steps:
    1. Get the encryption key using HKDF defined in RFC5869
    2. Decrypt the JWE token using the encryption key
    3. Create a JSON object from the decrypted JWE token
    '''
    # Retrieve the same JWT_SECRET which was used to encrypt the JWE token on the NextAuth Server
    jwt_secret = os.getenv("NEXT_AUTH_SECRET")
    encryption_key = getDerivedEncryptionKey(jwt_secret)
    payload_str = jwe.decrypt(token, encryption_key).decode()
    payload: dict[str, Any] = json.loads(payload_str)
    
    return payload


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        
        
        session_token = request.cookies.get("next-auth.session-token")
        print(f"Session token: {session_token}")    
        if session_token:
            
            session = get_token(session_token)


            if session:
                email = session.get("email")
                user = await prisma.user.find_unique(
                    where={'email': email},
                )

                if user:
                    # Store the user in the request state
                    request.state.userId = user.id
                    return await call_next(request)

        return JSONResponse({"message": "Unauthorized"}, status_code=401)
