import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { catalogApi, getApiErrorMessage, isRequestCanceled } from '../api/catalogApi';
import { CatalogSkeleton, EmptyState, ProductCard } from '../components/Ui';

const PRICE_RANGE_LABELS = {
  low: 'Dưới 20 triệu',
  middle: 'Từ 20 – 30 triệu',
  high: 'Trên 30 triệu',
};

export default function Catalog({ user, wishIds = [], onAddCart, onToggleWish }) {
  const [params, setParams] = useSearchParams();
  const urlKeyword = (params.get('q') || '').trim();

  const [keywordInput, setKeywordInput] = useState(urlKeyword);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sort, setSort] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const laptopRequestIdRef = useRef(0);
  const laptopAbortRef = useRef(null);

  useEffect(() => {
    setKeywordInput(urlKeyword);
  }, [urlKeyword]);

  const loadTaxonomy = useCallback(async (signal) => {
    try {
      const [brandList, categoryList] = await Promise.all([
        catalogApi.getBrands({ signal }),
        catalogApi.getCategories({ signal }),
      ]);
      if (!signal?.aborted) {
        setBrands(brandList);
        setCategories(categoryList);
      }
    } catch {
      // Lỗi mạng sẽ được hiển thị ở phần tải danh sách laptop
    }
  }, []);

  const loadLaptops = useCallback(async () => {
    if (laptopAbortRef.current) {
      laptopAbortRef.current.abort();
    }
    const controller = new AbortController();
    laptopAbortRef.current = controller;
    const requestId = ++laptopRequestIdRef.current;

    setLoading(true);
    setError('');

    try {
      const list = await catalogApi.getLaptops(
        {
          keyword: urlKeyword,
          brandId: brand || undefined,
          categoryId: category || undefined,
          priceRange: priceRange || undefined,
          sortBy: sort || undefined,
        },
        { signal: controller.signal }
      );
      if (requestId === laptopRequestIdRef.current && !controller.signal.aborted) {
        setProducts(list);
      }
    } catch (err) {
      if (isRequestCanceled(err) || controller.signal.aborted || requestId !== laptopRequestIdRef.current) {
        return;
      }
      setProducts([]);
      setError(getApiErrorMessage(err, 'Không thể tải danh sách laptop.'));
    } finally {
      if (requestId === laptopRequestIdRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [urlKeyword, brand, category, priceRange, sort]);

  useEffect(() => {
    const controller = new AbortController();
    loadTaxonomy(controller.signal);
    return () => controller.abort();
  }, [loadTaxonomy]);

  useEffect(() => {
    loadLaptops();
    return () => {
      if (laptopAbortRef.current) {
        laptopAbortRef.current.abort();
      }
    };
  }, [loadLaptops]);

  function submitSearch(e) {
    e.preventDefault();
    const trimmed = keywordInput.trim();
    if (trimmed === urlKeyword) {
      loadLaptops();
    } else {
      setParams(trimmed ? { q: trimmed } : {});
    }
  }

  function resetSearch() {
    setKeywordInput('');
    setParams({});
    setBrand('');
    setCategory('');
    setPriceRange('');
    setSort('');
  }

  function handleRetry() {
    if (brands.length === 0 || categories.length === 0) {
      loadTaxonomy();
    }
    loadLaptops();
  }

  const activeFilterCount = [urlKeyword, brand, category, priceRange].filter(Boolean).length;
  const selectedBrandName = brands.find((b) => String(b.id) === String(brand))?.name;
  const selectedCategoryName = categories.find((c) => String(c.id) === String(category))?.name;

  return (
    <Container className="py-4">
      <section className="catalog-intro-bar">
        <div className="catalog-intro-text">
          <div className="eyebrow">DANH MỤC SẢN PHẨM</div>
          <h1>Laptop chính hãng theo nhu cầu sử dụng</h1>
          <p>
            Tra cứu cấu hình chi tiết, đối chiếu giá bán niêm yết và kiểm tra số lượng tồn kho thực tế.
          </p>
        </div>

        <div className="quick-category-pills" role="tablist" aria-label="Lọc nhanh theo danh mục">
          <button
            type="button"
            className={'category-pill ' + (category === '' ? 'active' : '')}
            onClick={() => setCategory('')}
          >
            Tất cả laptop
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              className={'category-pill ' + (String(category) === String(cat.id) ? 'active' : '')}
              onClick={() => setCategory(String(cat.id))}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section id="products" className="catalog-section">
        <div className="d-lg-none mb-3">
          <Button
            variant="outline-secondary"
            className="w-100 d-flex justify-content-between align-items-center mobile-filter-toggle"
            onClick={() => setMobileFilterOpen((prev) => !prev)}
          >
            <span>
              Bộ lọc tìm kiếm {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </span>
            <span>{mobileFilterOpen ? 'Thu gọn ▲' : 'Mở bộ lọc ▼'}</span>
          </Button>
        </div>

        <Row className="g-4">
          <Col lg={3} className={mobileFilterOpen ? 'd-block' : 'd-none d-lg-block'}>
            <aside className="filter-panel" aria-label="Bộ lọc sản phẩm">
              <div className="filter-header">
                <h5>Bộ lọc tìm kiếm</h5>
                {activeFilterCount > 0 || sort ? (
                  <button type="button" className="filter-reset-btn" onClick={resetSearch}>
                    Xóa bộ lọc
                  </button>
                ) : null}
              </div>

              <Form onSubmit={submitSearch} className="mb-3">
                <Form.Group className="mb-2">
                  <Form.Label htmlFor="catalog-keyword">Từ khóa</Form.Label>
                  <Form.Control
                    id="catalog-keyword"
                    placeholder="Tên máy, CPU, RAM, SKU..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                  />
                </Form.Group>
                <Button variant="danger" type="submit" className="w-100">
                  Tìm kiếm
                </Button>
              </Form>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="catalog-brand">Thương hiệu</Form.Label>
                <Form.Select
                  id="catalog-brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option value="">Tất cả thương hiệu</option>
                  {brands.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="catalog-category">Danh mục</Form.Label>
                <Form.Select
                  id="catalog-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="catalog-price-range">Khoảng giá</Form.Label>
                <Form.Select
                  id="catalog-price-range"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="">Tất cả mức giá</option>
                  <option value="low">Dưới 20 triệu</option>
                  <option value="middle">Từ 20 – 30 triệu</option>
                  <option value="high">Trên 30 triệu</option>
                </Form.Select>
              </Form.Group>

              <Button
                variant="outline-secondary"
                className="w-100"
                disabled={!activeFilterCount && !sort && !keywordInput}
                onClick={resetSearch}
              >
                Đặt lại mặc định
              </Button>
            </aside>
          </Col>

          <Col lg={9}>
            <div className="result-toolbar">
              <div className="result-summary">
                {loading ? (
                  <span>Đang tải danh sách sản phẩm...</span>
                ) : error ? (
                  <span className="text-danger fw-semibold">Không thể tải dữ liệu</span>
                ) : (
                  <span>
                    Hiển thị <strong>{products.length}</strong> laptop
                  </span>
                )}
              </div>

              <div className="result-sort">
                <label htmlFor="catalog-sort" className="sort-label">
                  Sắp xếp:
                </label>
                <Form.Select
                  id="catalog-sort"
                  aria-label="Sắp xếp"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="">Mặc định</option>
                  <option value="asc">Giá: Thấp đến cao</option>
                  <option value="desc">Giá: Cao đến thấp</option>
                </Form.Select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="active-filters-bar">
                <span className="active-filters-label">Đang lọc:</span>
                {urlKeyword && (
                  <button
                    type="button"
                    className="active-filter-chip"
                    onClick={() => {
                      setKeywordInput('');
                      setParams({});
                    }}
                  >
                    Từ khóa: “{urlKeyword}” <span>×</span>
                  </button>
                )}
                {selectedBrandName && (
                  <button
                    type="button"
                    className="active-filter-chip"
                    onClick={() => setBrand('')}
                  >
                    Hãng: {selectedBrandName} <span>×</span>
                  </button>
                )}
                {selectedCategoryName && (
                  <button
                    type="button"
                    className="active-filter-chip"
                    onClick={() => setCategory('')}
                  >
                    Nhóm: {selectedCategoryName} <span>×</span>
                  </button>
                )}
                {priceRange && PRICE_RANGE_LABELS[priceRange] && (
                  <button
                    type="button"
                    className="active-filter-chip"
                    onClick={() => setPriceRange('')}
                  >
                    Giá: {PRICE_RANGE_LABELS[priceRange]} <span>×</span>
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <CatalogSkeleton count={6} />
            ) : error ? (
              <div className="api-error-panel" role="alert">
                <h4>Không thể tải danh sách laptop</h4>
                <p>{error}</p>
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                  <Button variant="danger" onClick={handleRetry}>
                    Thử lại
                  </Button>
                  {activeFilterCount > 0 && (
                    <Button variant="outline-secondary" onClick={resetSearch}>
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                title="Không tìm thấy laptop phù hợp"
                text="Không có sản phẩm nào khớp với điều kiện tìm kiếm và bộ lọc hiện tại."
                action="Xóa bộ lọc"
                onAction={resetSearch}
              />
            ) : (
              <Row className="g-3">
                {products.map((product) => (
                  <Col md={6} xl={4} key={product.id}>
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
            )}
          </Col>
        </Row>
      </section>
    </Container>
  );
}
