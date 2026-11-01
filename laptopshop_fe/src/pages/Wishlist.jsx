import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { EmptyState, PageTitle, ProductCard } from '../components/Ui';

export function Wishlist({ data, wishIds, user, onToggleWish, onAddCart }) {
  const products = data.wishlistProducts[String(user.id)] || [];

  return (
    <Container className="py-4">
      <PageTitle
        title="Laptop yêu thích"
        description="Những sản phẩm bạn đã lưu để xem lại."
      />

      {products.length === 0 ? (
        <EmptyState
          title="Chưa có laptop yêu thích"
          text="Nhấn biểu tượng trái tim ở sản phẩm để lưu."
          to="/"
          action="Khám phá laptop"
        />
      ) : (
        <Row className="g-3">
          {products.map((item) => (
            <Col md={6} lg={3} key={item.laptopId}>
              <ProductCard
                product={item.product}
                user={user}
                isFavorite={wishIds.includes(item.laptopId)}
                onToggleWish={onToggleWish}
                onAddCart={onAddCart}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default Wishlist;
