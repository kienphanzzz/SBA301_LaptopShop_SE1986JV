import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState, PageTitle, ProductCard } from '../components/Ui';

export default function Catalog({ data, user, wishIds, onAddCart, onToggleWish }) {
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('q') || '');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sort, setSort] = useState('');
  useEffect(() => { setKeyword(params.get('q') || ''); }, [params]);
  const keywordText = (params.get('q') || '').toLowerCase().trim();

  let products = data.products.filter((item) => item.status === 'ACTIVE');
  if (keywordText) products = products.filter((item) => (item.name + ' ' + item.specs + ' ' + item.description).toLowerCase().includes(keywordText));
  if (brand) products = products.filter((item) => item.brandId === Number(brand));
  if (category) products = products.filter((item) => item.categoryId === Number(category));
  if (priceRange === 'low') products = products.filter((item) => item.price < 20000000);
  if (priceRange === 'middle') products = products.filter((item) => item.price >= 20000000 && item.price <= 30000000);
  if (priceRange === 'high') products = products.filter((item) => item.price > 30000000);
  if (sort === 'asc') products = [...products].sort((a, b) => a.price - b.price);
  if (sort === 'desc') products = [...products].sort((a, b) => b.price - a.price);

  function submitSearch(e) { e.preventDefault(); setParams(keyword ? { q: keyword } : {}); }
  function resetSearch() { setKeyword(''); setParams({}); setBrand(''); setCategory(''); setPriceRange(''); setSort(''); }

  return <>
    <Container className="mt-4">
      <div className="hero-banner">
        <div className="hero-content">
          <span className="hero-pill">LAPTOPHUB · BACK TO SCHOOL</span>
          <h1>Chọn laptop xịn.<br/><span>Giá cực hợp lý.</span></h1>
          <p>Laptop học tập, gaming và làm việc được sắp xếp rõ ràng, dễ tìm kiếm, dễ so sánh.</p>
          <a className="btn btn-light hero-button" href="#products">Khám phá ngay <span>→</span></a>
          <div className="hero-benefits"><span>✓ Nhiều thương hiệu</span><span>✓ Bộ lọc dễ dùng</span><span>✓ Đặt hàng COD</span></div>
        </div>
        <div className="hero-visual"><div className="hero-circle"/><img src="/assets/laptop-dark.svg" alt="Laptop gaming" /><span className="hero-price">Ưu đãi hấp dẫn</span></div>
      </div>
      <Row className="benefit-row g-3 mt-1">
        <Col md={4}><div className="benefit-card"><b>🚚</b><div><strong>Mua sắm dễ dàng</strong><span>Đặt hàng và theo dõi đơn trực tuyến</span></div></div></Col>
        <Col md={4}><div className="benefit-card"><b>🛡️</b><div><strong>Thông tin minh bạch</strong><span>Cấu hình, giá và tồn kho rõ ràng</span></div></div></Col>
        <Col md={4}><div className="benefit-card"><b>💻</b><div><strong>Đủ nhóm nhu cầu</strong><span>Học tập, gaming, đồ họa, văn phòng</span></div></div></Col>
      </Row>
      <section id="products" className="catalog-section">
        <PageTitle tag="DANH MỤC SẢN PHẨM" title="Laptop dành cho bạn" description="Tìm nhanh chiếc laptop phù hợp với học tập và công việc." />
        <Row className="g-4">
          <Col lg={3}>
            <div className="filter-panel">
              <div className="filter-header"><h5>Bộ lọc sản phẩm</h5><Button variant="link" size="sm" onClick={resetSearch}>Xóa lọc</Button></div>
              <Form onSubmit={submitSearch}>
                <Form.Group className="mb-3"><Form.Label>Từ khóa</Form.Label><Form.Control placeholder="Tên hoặc cấu hình..." value={keyword} onChange={(e) => setKeyword(e.target.value)}/></Form.Group>
                <Button variant="danger" type="submit" className="w-100 mb-3">Tìm kiếm</Button>
              </Form>
              <Form.Group className="mb-3"><Form.Label>Thương hiệu</Form.Label><Form.Select value={brand} onChange={(e) => setBrand(e.target.value)}><option value="">Tất cả thương hiệu</option>{data.brands.filter((item) => item.status === 'ACTIVE').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Form.Select></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Danh mục</Form.Label><Form.Select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Tất cả danh mục</option>{data.categories.filter((item) => item.status === 'ACTIVE').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Form.Select></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Khoảng giá</Form.Label><Form.Select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}><option value="">Tất cả mức giá</option><option value="low">Dưới 20 triệu</option><option value="middle">20 đến 30 triệu</option><option value="high">Trên 30 triệu</option></Form.Select></Form.Group>
            </div>
          </Col>
          <Col lg={9}>
            <div className="result-toolbar"><span><strong>{products.length}</strong> sản phẩm phù hợp</span><Form.Select aria-label="Sắp xếp" value={sort} onChange={(e) => setSort(e.target.value)}><option value="">Sắp xếp mặc định</option><option value="asc">Giá tăng dần</option><option value="desc">Giá giảm dần</option></Form.Select></div>
            {products.length === 0 ? <EmptyState title="Không tìm thấy sản phẩm phù hợp" text="Thử bỏ bớt điều kiện tìm kiếm." /> :
              <Row className="g-3">{products.map((product) => <Col md={6} xl={4} key={product.id}><ProductCard product={product} brands={data.brands} user={user} isFavorite={wishIds.includes(product.id)} onAddCart={onAddCart} onToggleWish={onToggleWish}/></Col>)}</Row>}
          </Col>
        </Row>
      </section>
    </Container>
  </>;
}
