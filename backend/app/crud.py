from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
import bcrypt
from . import models, schemas

def hash_user_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_user_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def find_customer_by_id(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def find_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def fetch_all_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).offset(skip).limit(limit).all()

def add_new_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(
        full_name=customer.full_name,
        email=customer.email,
        phone_number=customer.phone_number,
        address=customer.address,
        city=customer.city,
        segment=customer.segment
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def modify_customer_record(db: Session, customer_id: int, customer_update: schemas.CustomerUpdate):
    db_customer = find_customer_by_id(db, customer_id)
    if not db_customer:
        return None
    
    update_data = customer_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)
    
    db.commit()
    db.refresh(db_customer)
    return db_customer

def remove_customer_record(db: Session, customer_id: int):
    db_customer = find_customer_by_id(db, customer_id)
    if not db_customer:
        return None
    db.delete(db_customer)
    db.commit()
    return db_customer

def find_product_by_id(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def find_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def fetch_all_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def add_new_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        quantity_in_stock=product.quantity_in_stock
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def modify_product_record(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    db_product = find_product_by_id(db, product_id)
    if not db_product:
        return None
    
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

def remove_product_record(db: Session, product_id: int):
    db_product = find_product_by_id(db, product_id)
    if not db_product:
        return None
    db.delete(db_product)
    db.commit()
    return db_product

def find_order_by_id(db: Session, order_id: int):
    return db.query(models.Orders)\
        .options(
            joinedload(models.Orders.customer),
            joinedload(models.Orders.items).joinedload(models.OrderItems.product)
        )\
        .filter(models.Orders.id == order_id).first()

def fetch_all_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Orders)\
        .options(
            joinedload(models.Orders.customer),
            joinedload(models.Orders.items).joinedload(models.OrderItems.product)
        )\
        .offset(skip).limit(limit).all()

def place_new_order(db: Session, order: schemas.OrderCreate):
    customer = find_customer_by_id(db, order.customer_id)
    if not customer:
        raise ValueError(f"Customer with ID {order.customer_id} does not exist.")
    
    db_order = models.Orders(
        customer_id=order.customer_id,
        total_amount=0
    )
    db.add(db_order)
    
    total_amount = 0
    for item in order.items:
        product = find_product_by_id(db, item.product_id)
        if not product:
            db.rollback()
            raise ValueError(f"Product with ID {item.product_id} does not exist.")
        
        if product.quantity_in_stock < item.quantity:
            db.rollback()
            raise ValueError(
                f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                f"Requested: {item.quantity}, Available: {product.quantity_in_stock}"
            )
        
        product.quantity_in_stock -= item.quantity
        total_amount += product.price * item.quantity
        
        db_item = models.OrderItems(
            order=db_order,
            product_id=item.product_id,
            quantity=item.quantity,
            note=item.note
        )
        db.add(db_item)
        
    db_order.total_amount = total_amount
    
    try:
        db.commit()
        db.refresh(db_order)
        return db_order
    except Exception as e:
        db.rollback()
        raise e

def cancel_order_by_id(db: Session, order_id: int):
    db_order = find_order_by_id(db, order_id)
    if not db_order:
        return None
    
    for item in db_order.items:
        product = find_product_by_id(db, item.product_id)
        if product:
            product.quantity_in_stock += item.quantity
            
    db.delete(db_order)
    db.commit()
    return db_order

def fetch_dashboard_metrics(db: Session):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Orders).count()
    low_stock = db.query(models.Product).filter(models.Product.quantity_in_stock < 10).all()
    
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_count": len(low_stock),
        "low_stock_products": [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "price": float(p.price),
                "quantity_in_stock": p.quantity_in_stock
            }
            for p in low_stock
        ]
    }

def find_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def find_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def find_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def register_new_user(db: Session, user_create: schemas.UserCreate):
    hashed_pwd = hash_user_password(user_create.password)
    
    db_customer = None
    if user_create.role == "buyer":
        existing_cust = find_customer_by_email(db, user_create.email)
        if existing_cust:
            db_customer = existing_cust
        else:
            db_customer = models.Customer(
                full_name=user_create.full_name or user_create.username,
                email=user_create.email,
                phone_number=user_create.phone_number or "0000000000",
                address=user_create.address or "",
                city=user_create.city or "",
                segment=user_create.segment or "Retail"
            )
            db.add(db_customer)
            db.flush()
            
    db_user = models.User(
        username=user_create.username,
        email=user_create.email,
        hashed_password=hashed_pwd,
        role=user_create.role,
        customer_id=db_customer.id if db_customer else None
    )
    
    db.add(db_user)
    try:
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise e
