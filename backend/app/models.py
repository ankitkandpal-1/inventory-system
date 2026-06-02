from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .database import Base

class Customer(Base):
    __tablename__ = 'Customer'

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    segment = Column(String, nullable=True)

    orders = relationship("Orders", back_populates="customer", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = 'Product'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, nullable=False)
    price = Column(Numeric, nullable=False)
    quantity_in_stock = Column(Integer, nullable=False)

    order_items = relationship("OrderItems", back_populates="product")


class Orders(Base):
    __tablename__ = 'Orders'

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey('Customer.id'), nullable=False)
    total_amount = Column(Numeric, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItems", back_populates="order", cascade="all, delete-orphan")


class OrderItems(Base):
    __tablename__ = 'OrderItems'

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('Orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('Product.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    note = Column(String, nullable=True)

    order = relationship("Orders", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class User(Base):
    __tablename__ = 'User'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    customer_id = Column(Integer, ForeignKey('Customer.id', ondelete='SET NULL'), nullable=True)

    customer = relationship("Customer")


