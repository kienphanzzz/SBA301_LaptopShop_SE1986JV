import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { CatalogSkeleton, EmptyState, PageTitle, ProductCard } from '../components/Ui';

// Component danh sách ngắn theo nhóm nhu cầu từ dữ liệu ban đầu
function FeaturedLaptopShortlists({ products, brands, user, wishIds, onAddCart, onToggleWish, onSelectCategory }) {
  const [activeGroupId, setActiveGroupId] = useState(1);

  const groups = [
    { id: 1, title: 'Laptop học tập', desc: 'Thiết kế gọn gàng, hiệu năng mượt mà cho học tập và tin học văn phòng', icon: '🎓' },
    { id: 2, title: 'Laptop gaming', desc: 'Cấu hình mạnh mẽ, đồ họa rời mượt mà cho game và tác vụ kỹ thuật', icon: '🎮' },
    { id: 3, title: 'Laptop mỏng nhẹ', desc: 'Thời trang, mỏng nhẹ cao cấp, thời lượng pin dài tiện di chuyển', icon: '✨' },
  ];

  // Lọc danh sách ngắn từ dữ liệu theo categoryId đang chọn
  const shortList = products
    .filter((item) => item.status === 'ACTIVE' && item.categoryId === activeGroupId)
    .slice(0, 3);

  const currentGroup = groups.find((g) => g.id === activeGroupId);

  return (
    <div className="featured-shortlist-box my-4 p-4 bg-white rounded-3 border">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <div className="eyebrow">GỢI Ý NHANH</div>
          <h3 className="h5 mb-1 fw-bold">{currentGroup?.title}</h3>
          <p className="text-muted small mb-0">{currentGroup?.desc}</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {groups.map((group) => (
            <Button
              key={group.id}
              variant={activeGroupId === group.id ? 'danger' : 'outline-secondary'}
              size="sm"
              className="rounded-pill px-3"
              onClick={() => setActiveGroupId(group.id)}
            >
              {group.icon} {group.title}
            </Button>
          ))}
        </div>
      </div>
      <Row className="g-3">
        {shortList.map((product) => (
          <Col md={4} key={product.id}>
            <ProductCard
              product={product}
              brands={brands}
              user={user}
              isFavorite={wishIds.includes(product.id)}
              onAddCart={onAddCart}
              onToggleWish={onToggleWish}
            />
          </Col>
        ))}
      </Row>
      <div className="text-center mt-3 pt-2">
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => {
            onSelectCategory(String(activeGroupId));
            const target = document.getElementById('products');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Xem toàn bộ nhóm “{currentGroup?.title}” ở danh mục bên dưới ↓
        </Button>
      </div>
    </div>
  );
}

export default function Catalog({ data, user, wishIds, onAddCart, onToggleWish }) {
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('q') || '');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { setKeyword(params.get('q') || ''); }, [params]);
  // Giả lập loading lần đầu khi trang tải
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);
  const keywordText = (params.get('q') || '').toLowerCase().trim();

  const quickCategories = [
    { id: '', name: 'Tất cả laptop' },
    { id: '1', name: 'Văn phòng – học tập' },
    { id: '2', name: 'Gaming' },
    { id: '3', name: 'Mỏng nhẹ – cao cấp' },
    { id: '4', name: 'Đồ họa – kỹ thuật' },
  ];

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

      {/* Danh sách ngắn gợi ý theo nhu cầu: Laptop học tập, Laptop gaming, Laptop mỏng nhẹ */}
      <FeaturedLaptopShortlists
        products={data.products}
        brands={data.brands}
        user={user}
        wishIds={wishIds}
        onAddCart={onAddCart}
        onToggleWish={onToggleWish}
        onSelectCategory={setCategory}
      />

      <section id="products" className="catalog-section">
        <PageTitle tag="DANH MỤC SẢN PHẨM" title="Laptop dành cho bạn" description="Tìm nhanh chiếc laptop phù hợp với học tập và công việc." />

        {/* Thanh lựa chọn nhanh danh mục */}
        <div className="quick-category-bar mb-4 p-3 bg-white rounded-3 border d-flex flex-wrap align-items-center gap-2">
          <span className="fw-bold text-secondary me-2 small">Lựa chọn nhanh:</span>
          {quickCategories.map((item) => (
            <Button
              key={item.id}
              variant={category === item.id ? 'danger' : 'outline-secondary'}
              size="sm"
              className="rounded-pill px-3"
              onClick={() => setCategory(item.id)}
            >
              {item.name}
            </Button>
          ))}
        </div>

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
            {loading
              ? <CatalogSkeleton count={6} />
              : products.length === 0
                ? <EmptyState title="Không tìm thấy sản phẩm phù hợp" text="Thử bỏ bớt điều kiện tìm kiếm." />
                : <Row className="g-3">{products.map((product) => <Col md={6} xl={4} key={product.id}><ProductCard product={product} brands={data.brands} user={user} isFavorite={wishIds.includes(product.id)} onAddCart={onAddCart} onToggleWish={onToggleWish}/></Col>)}</Row>
            }
          </Col>
        </Row>
      </section>
    </Container>
  </>;
}
