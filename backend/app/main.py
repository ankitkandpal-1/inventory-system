from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload
from typing import List
import jwt
from datetime import datetime, timedelta, timezone

from . import crud, models, schemas
from .database import get_db, engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    try:
        if db.query(models.Product).count() == 0:
            default_products = [
                models.Product(
                    name="Tactile Mechanical Keyboard",
                    sku="KB-TACTILE-99",
                    price=129.99,
                    quantity_in_stock=45
                ),
                models.Product(
                    name="Liquid-Cooled Workstation",
                    sku="SYS-PRO-V8",
                    price=2499.99,
                    quantity_in_stock=15
                ),
                models.Product(
                    name="Smart Intelligent Espresso Brewer",
                    sku="COFFEE-PID-03",
                    price=599.00,
                    quantity_in_stock=25
                ),
                models.Product(
                    name="Editorial Tailored Trench Coat",
                    sku="AP-TRENCH-88",
                    price=189.50,
                    quantity_in_stock=30
                )
            ]
            db.add_all(default_products)
            db.commit()
    except Exception as e:
        db.rollback()
    finally:
        db.close()

seed_database()

app = FastAPI(
    title="EasyMart Inventory Management API",
    description="FastAPI Backend for EasyMart Inventory and Order Management System with Auth",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "EASYMART_SUPER_SECRET_KEY_CINEMATIC_DEPTH"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        
    db_user = crud.find_user_by_username(db, username=username)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return db_user

def require_role(allowed_roles: List[str]):
    def dependency(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation forbidden: insufficient privileges"
            )
        return current_user
    return dependency

@app.get("/", status_code=status.HTTP_200_OK)
def read_root():
    return {
        "message": "Welcome to EasyMart Inventory Management API with Authentication",
        "version": "1.1.0",
        "docs_url": "/docs",
        "status": "healthy"
    }

@app.post("/auth/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(user_create: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_username = crud.find_user_by_username(db, username=user_create.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered."
        )
    existing_email = crud.find_user_by_email(db, email=user_create.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    db_user = crud.register_new_user(db, user_create=user_create)
    access_token = create_access_token(
        data={"sub": db_user.username, "role": db_user.role}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@app.post("/auth/login", response_model=schemas.Token)
def login(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.find_user_by_username(db, username=user_login.username_or_email)
    if not db_user:
        db_user = crud.find_user_by_email(db, email=user_login.username_or_email)
        
    if not db_user or not crud.check_user_password(user_login.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )
        
    access_token = create_access_token(
        data={"sub": db_user.username, "role": db_user.role}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@app.get("/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/customers", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer: schemas.CustomerCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(require_role(["admin"]))
):
    db_customer = crud.find_customer_by_email(db, email=customer.email)
    if db_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A customer with this email already exists."
        )
    return crud.add_new_customer(db=db, customer=customer)

@app.get("/customers", response_model=List[schemas.CustomerResponse])
def read_customers(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin"]))
):
    return crud.fetch_all_customers(db, skip=skip, limit=limit)

@app.get("/customers/{customer_id}", response_model=schemas.CustomerResponse)
def read_customer(
    customer_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin"]))
):
    db_customer = crud.find_customer_by_id(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@app.put("/customers/{customer_id}", response_model=schemas.CustomerResponse)
def update_customer(
    customer_id: int, 
    customer_update: schemas.CustomerUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin"]))
):
    if customer_update.email:
        existing = crud.find_customer_by_email(db, email=customer_update.email)
        if existing and existing.id != customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A customer with this email already exists."
            )
            
    db_customer = crud.modify_customer_record(db, customer_id=customer_id, customer_update=customer_update)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@app.delete("/customers/{customer_id}", response_model=schemas.CustomerResponse)
def delete_customer(
    customer_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin"]))
):
    db_customer = crud.remove_customer_record(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@app.post("/products", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin"]))
):
    db_product = crud.find_product_by_sku(db, sku=product.sku)
    if db_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A product with SKU '{product.sku}' already exists."
        )
    return crud.add_new_product(db=db, product=product)

@app.get("/products", response_model=List[schemas.ProductResponse])
def read_products(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.fetch_all_products(db, skip=skip, limit=limit)

@app.get("/products/{product_id}", response_model=schemas.ProductResponse)
def read_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_product = crud.find_product_by_id(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.put("/products/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int, 
    product_update: schemas.ProductUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin"]))
):
    if product_update.sku:
        existing = crud.find_product_by_sku(db, sku=product_update.sku)
        if existing and existing.id != product_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A product with SKU '{product_update.sku}' already exists."
            )
            
    db_product = crud.modify_product_record(db, product_id=product_id, product_update=product_update)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.delete("/products/{product_id}", response_model=schemas.ProductResponse)
def delete_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin"]))
):
    db_product = crud.remove_product_record(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.post("/orders", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order: schemas.OrderCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == "buyer":
        if not current_user.customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile has no associated Customer record. Please complete registration details."
            )
        order.customer_id = current_user.customer_id
        
    try:
        return crud.place_new_order(db=db, order=order)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during order creation: {str(e)}"
        )

@app.get("/orders", response_model=List[schemas.OrderResponse])
def read_orders(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == "buyer":
        if not current_user.customer_id:
            return []
        return db.query(models.Orders)\
            .options(
                joinedload(models.Orders.customer),
                joinedload(models.Orders.items).joinedload(models.OrderItems.product)
            )\
            .filter(models.Orders.customer_id == current_user.customer_id)\
            .offset(skip).limit(limit).all()
            
    return crud.fetch_all_orders(db, skip=skip, limit=limit)

@app.get("/orders/{order_id}", response_model=schemas.OrderResponse)
def read_order(
    order_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_order = crud.find_order_by_id(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if current_user.role == "buyer" and db_order.customer_id != current_user.customer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this order."
        )
    return db_order

@app.delete("/orders/{order_id}", response_model=schemas.OrderResponse)
def delete_order(
    order_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(["admin"]))
):
    db_order = crud.find_order_by_id(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order_response = schemas.OrderResponse.model_validate(db_order)
    crud.cancel_order_by_id(db, order_id=order_id)
    return order_response

@app.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == "buyer":
        total_orders = db.query(models.Orders).filter(models.Orders.customer_id == current_user.customer_id).count()
        total_products = db.query(models.Product).count()
        low_stock = db.query(models.Product).filter(models.Product.quantity_in_stock < 10).all()
        return {
            "total_products": total_products,
            "total_customers": 1,
            "total_orders": total_orders,
            "low_stock_count": len(low_stock),
            "low_stock_products": []
        }
        
    return crud.fetch_dashboard_metrics(db)
