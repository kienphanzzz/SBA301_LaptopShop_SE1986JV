import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { catalogApi, getApiErrorMessage, isRequestCanceled } from '../api/catalogApi';
import { money } from '../data/helpers';

const FALLBACK_IMAGE = '/assets/laptop-silver.svg';

function parseSpecRows(specsText) {
  if (!specsText || typeof specsText !== 'string') {
    return [];
  }
  const parts = specsText
    .split('•')
    .map((item) => item.trim())
    .filter(Boolean);

  const defaultLabels = ['Vi xử lý (CPU)', 'Bộ nhớ RAM', 'Ổ cứng lưu trữ', 'Màn hình / Đồ họa', 'Thông số bổ sung'];

  return parts.map((value, index) => {
    const lower = value.toLowerCase();
    let label = defaultLabels[index] || `Thông số ${index + 1}`;
    if (lower.includes('ram')) {
      label = 'Bộ nhớ RAM';
    } else if (lower.includes('ssd') || lower.includes('hdd') || lower.includes('nvme')) {
      label = 'Ổ cứng lưu trữ';
    } else if (lower.includes('inch') || lower.includes('oled') || lower.includes('fhd') || lower.includes('ips')) {
      label = 'Màn hình hiển thị';
    } else if (lower.includes('rtx') || lower.includes('gtx') || lower.includes('radeon')) {
      label = 'Card đồ họa';
    } else if (lower.includes('intel') || lower.includes('amd') || lower.includes('ryzen') || lower.includes('apple') || lower.includes('core')) {
      label = 'Vi xử lý (CPU)';
    }
    return { label, value };
  });
}

export default function ProductDetails({ user, wishIds = [], onAddCart, onToggleWish }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const detailRequestIdRef = useRef(0);
  const detailAbortRef = useRef(null);

  const loadProduct = useCallback(async () => {
    if (detailAbortRef.current) {
      detailAbortRef.current.abort();
    }

    const numericId = Number(id);
    if (!id || !Number.isInteger(numericId) || numericId <= 0) {
      setProduct(null);
      setNotFound(true);
      setError('Mã sản phẩm không hợp lệ hoặc không tồn tại.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    detailAbortRef.current = controller;
    const requestId = ++detailRequestIdRef.current;

    setLoading(true);
    setError('');
    setNotFound(false);

    try {
      const data = await catalogApi.getLaptopById(numericId, {
        signal: controller.signal,
      });
      if (requestId === detailRequestIdRef.current && !controller.signal.aborted) {
        setProduct(data);
        setQuantity(1);
      }
    } catch (err) {
      if (isRequestCanceled(err) || controller.signal.aborted || requestId !== detailRequestIdRef.current) {
        return;
      }
      setProduct(null);
      const status = err?.response?.status;
      if (status === 404 || status === 400) {
        setNotFound(true);
      }
      setError(getApiErrorMessage(err, 'Không thể tải thông tin chi tiết laptop.'));
    } finally {
      if (requestId === detailRequestIdRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
    return () => {
      if (detailAbortRef.current) {
        detailAbortRef.current.abort();
      }
    };
  }, [loadProduct]);

  if (loading) {
    return (
      <Container className="py-4">
        <div className="skeleton skeleton-line short mb-4" style={{ maxWidth: 260 }} />
        <Row className="g-4">
          <Col lg={6}>
            <div className="detail-image-box">
              <div className="skeleton" style={{ width: '80%', height: 280 }} />
            </div>
          </Col>
          <Col lg={6}>
            <div className="detail-summary-card">
              <div className="skeleton skeleton-line short mb-3" />
              <div className="skeleton skeleton-line mb-3" style={{ height: 32 }} />
              <div className="skeleton skeleton-price mb-4" style={{ height: 44 }} />
              <div className="skeleton skeleton-line mb-2" />
              <div className="skeleton skeleton-line medium mb-4" />
              <div className="skeleton skeleton-btn" style={{ height: 44 }} />
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <div className="api-error-panel">
          <h4>{notFound ? 'Không tìm thấy sản phẩm' : 'Không thể tải thông tin sản phẩm'}</h4>
          <p>
            {notFound
              ? 'Sản phẩm bạn đang tìm không tồn tại hoặc hiện đã ngừng kinh doanh.'
              : error}
          </p>
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            {!notFound && (
              <Button variant="danger" onClick={loadProduct}>
                Thử lại
              </Button>
            )}
            <Button as={Link} to="/" variant={notFound ? 'danger' : 'outline-secondary'}>
              Quay lại danh mục laptop
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  const stock = Number(product.stockQuantity ?? 0);
  const available = product.status === 'ACTIVE' && stock > 0;
  const hasValidOldPrice = product.oldPrice != null && Number(product.oldPrice) > Number(product.price);
  const discountAmount = hasValidOldPrice ? Number(product.oldPrice) - Number(product.price) : 0;
  const specRows = parseSpecRows(product.specs);
  const isFavorite = wishIds.includes(product.id);

  function handleQuantityChange(e) {
    const raw = Number(e.target.value);
    if (Number.isNaN(raw) || raw < 1) {
      setQuantity(1);
      return;
    }
    if (stock > 0 && raw > stock) {
      setQuantity(stock);
      return;
    }
    setQuantity(Math.floor(raw));
  }

  return (
    <Container className="py-4">
      <nav aria-label="Breadcrumb" className="crumb mb-3">
        <Link to="/">Danh mục laptop</Link>
        {product.categoryName && (
          <>
            <span className="crumb-sep">/</span>
            <span>{product.categoryName}</span>
          </>
        )}
        <span className="crumb-sep">/</span>
        <span className="crumb-current">{product.name}</span>
      </nav>

      <Row className="g-4 align-items-stretch">
        <Col lg={6}>
          <div className="detail-image-box">
            <img
              src={product.image || FALLBACK_IMAGE}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </div>
        </Col>

        <Col lg={6}>
          <div className="detail-summary-card">
            <div className="detail-meta-top">
              <span className="detail-brand-tag">{product.brandName || 'Chính hãng'}</span>
              <span className="detail-sku">Mã SKU: {product.sku}</span>
            </div>

            <h1 className="detail-title">{product.name}</h1>

            <div className="detail-status-row">
              {!available ? (
                <span className="stock-status out">Tạm hết hàng</span>
              ) : stock <= 5 ? (
                <span className="stock-status low">Sắp hết hàng · Còn {stock} máy</span>
              ) : (
                <span className="stock-status ok">Còn hàng · Sẵn sàng giao ({stock} máy)</span>
              )}
              {product.categoryName && (
                <span className="detail-category-label">Nhóm: {product.categoryName}</span>
              )}
            </div>

            <div className="price-band">
              <div className="price-band-main">
                <strong className="detail-current-price">{money(product.price)}</strong>
                {hasValidOldPrice && (
                  <del className="detail-old-price">{money(product.oldPrice)}</del>
                )}
              </div>
              {hasValidOldPrice && discountAmount > 0 && (
                <div className="price-band-sub">
                  Tiết kiệm {money(discountAmount)} so với giá niêm yết cũ
                </div>
              )}
            </div>

            <div className="detail-highlights">
              <div className="detail-section-label">Cấu hình tóm tắt</div>
              {specRows.length > 0 ? (
                <ul className="detail-spec-list">
                  {specRows.map((row, idx) => (
                    <li key={idx}>
                      <span>{row.label}:</span> <strong>{row.value}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-0 text-secondary">{product.specs}</p>
              )}
            </div>

            {user?.role !== 'ADMIN' && (
              <div className="detail-purchase-box">
                <div className="d-flex flex-wrap gap-3 align-items-end">
                  <div>
                    <Form.Label htmlFor="detail-quantity" className="detail-qty-label">
                      Số lượng
                    </Form.Label>
                    <Form.Control
                      id="detail-quantity"
                      aria-label="Số lượng"
                      type="number"
                      min="1"
                      max={Math.max(stock, 1)}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="quantity-input"
                      disabled={!available}
                    />
                  </div>

                  <Button
                    variant="danger"
                    className="detail-buy-btn flex-grow-1"
                    disabled={!available || quantity < 1 || quantity > stock}
                    onClick={() => onAddCart(product.id, quantity, product)}
                  >
                    {available ? 'Thêm vào giỏ hàng' : 'Tạm hết hàng'}
                  </Button>

                  {user?.role === 'CUSTOMER' && (
                    <Button
                      variant={isFavorite ? 'danger' : 'outline-secondary'}
                      className="detail-wish-btn"
                      onClick={() => onToggleWish(product.id, product)}
                    >
                      {isFavorite ? '♥ Đã lưu' : '♡ Yêu thích'}
                    </Button>
                  )}
                </div>

                {!available && (
                  <p className="detail-out-note mb-0 mt-2">
                    Sản phẩm hiện đã hết tồn kho. Bạn có thể lưu vào danh sách yêu thích hoặc xem các mẫu laptop tương đương.
                  </p>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>

      <Row className="g-4 mt-1">
        <Col lg={7}>
          <div className="white-panel h-100">
            <h2 className="detail-panel-heading">Thông số kỹ thuật</h2>
            <table className="table details-table mb-0">
              <tbody>
                <tr>
                  <th>Thương hiệu</th>
                  <td>{product.brandName || 'Đang cập nhật'}</td>
                </tr>
                <tr>
                  <th>Danh mục</th>
                  <td>{product.categoryName || 'Đang cập nhật'}</td>
                </tr>
                <tr>
                  <th>Mã sản phẩm (SKU)</th>
                  <td>{product.sku}</td>
                </tr>
                {specRows.map((row, idx) => (
                  <tr key={idx}>
                    <th>{row.label}</th>
                    <td>{row.value}</td>
                  </tr>
                ))}
                <tr>
                  <th>Tình trạng tồn kho</th>
                  <td>{available ? `Còn ${stock} sản phẩm` : 'Hết hàng (0)'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Col>

        <Col lg={5}>
          <div className="white-panel h-100 d-flex flex-column justify-content-between">
            <div>
              <h2 className="detail-panel-heading">Đặc điểm sản phẩm</h2>
              <p className="detail-description-text">
                {product.description || 'Thông tin mô tả chi tiết đang được cập nhật.'}
              </p>
            </div>

            <div className="detail-policy-box">
              <div className="detail-section-label mb-2">Thông tin mua hàng tại LaptopHub</div>
              <ul className="detail-policy-list mb-0">
                <li>Thông tin cấu hình, giá bán và số lượng tồn kho được hiển thị minh bạch theo dữ liệu hệ thống.</li>
                <li>Hỗ trợ đặt mua trực tuyến và thanh toán tiền mặt khi nhận hàng (COD).</li>
              </ul>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
