from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
import uvicorn
from jose import JWTError, jwt
import datetime

app = FastAPI()

# Allow all origins for demo (limit in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "your-super-secret-key"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

fake_user = {
    "username": "student@example.com",
    "password": "password123",
}

class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=60))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_user(username: str, password: str):
    return username == fake_user["username"] and password == fake_user["password"]

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if not verify_user(form_data.username, form_data.password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token({"sub": form_data.username})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/")
async def home():
    return {"message": "Welcome to AI Detection API"}

@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...), token: str = Depends(oauth2_scheme), lang: Optional[str] = Form("en")):
    # Placeholder AI detection for images
    text_responses = {
        "en": "Image analyzed: AI generated = False",
        "es": "Imagen analizada: Generada por IA = Falso",
        "fr": "Image analysée : Générée par IA = Faux",
        "hi": "छवि विश्लेषित: एआई जनित = नहीं",
    }
    return {"result": text_responses.get(lang, text_responses["en"]), "confidence": 0.92, "type": "image"}

@app.post("/detect/text")
async def detect_text(text: str = Form(...), token: str = Depends(oauth2_scheme), lang: Optional[str] = Form("en")):
    ai_detected = "AI" in text or "ChatGPT" in text
    msg_map = {
        "en": f"Text AI generated: {ai_detected}",
        "es": f"Texto generado por IA: {ai_detected}",
        "fr": f"Texte généré par IA : {ai_detected}",
        "hi": f"पाठ एआई जनित: {ai_detected}",
    }
    return {"result": msg_map.get(lang, msg_map["en"]), "confidence": 0.85, "type": "text"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)