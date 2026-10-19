import { axiosClient } from './axiosClient';

const FALLBACK_IMAGE = '/assets/laptop-silver.svg';

function extractArrayPayload(payload, resourceName) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }
  if (payload && Array.isArray(payload.content)) {
    return payload.content;
  }
  throw new Error(`Dữ liệu ${resourceName} trả về từ máy chủ không đúng định dạng danh sách.`);
}

function extractObjectPayload(payload, resourceName) {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
      return payload.data;
    }
    return payload;
  }
  throw new Error(`Dữ liệu ${resourceName} trả về từ máy chủ không hợp lệ.`);
}

export function normalizeLaptop(item) {
  if (!item || typeof item !== 'object') {
    throw new Error('Bản ghi laptop không hợp lệ.');
  }
  const price = Number(item.price ?? 0);
  const rawOldPrice = item.oldPrice != null ? Number(item.oldPrice) : null;
  const oldPrice = rawOldPrice != null && rawOldPrice > price ? rawOldPrice : null;
  const stockQuantity = Number(item.stockQuantity ?? 0);
  const status = item.status || 'ACTIVE';
  const cleanDescription = typeof item.description === 'string'
    ? item.description.replace(/^\[DEMO\]\s*/i, '').trim()
    : '';

  return {
    id: Number(item.id),
    sku: item.sku || '',
    name: item.name || '',
    brandId: Number(item.brandId),
    brandName: item.brandName || '',
    categoryId: Number(item.categoryId),
    categoryName: item.categoryName || '',
    specs: item.specs || '',
    description: cleanDescription,
    image: item.image && String(item.image).trim() ? String(item.image).trim() : FALLBACK_IMAGE,
    price,
    oldPrice,
    stockQuantity,
    status,
    inStock: typeof item.inStock === 'boolean'
      ? item.inStock
      : status === 'ACTIVE' && stockQuantity > 0,
  };
}

export function normalizeTaxonomyItem(item) {
  return {
    id: Number(item.id),
    name: item.name || '',
    description: item.description || '',
    status: item.status || 'ACTIVE',
  };
}

export function isRequestCanceled(error) {
  return (
    error?.code === 'ERR_CANCELED' ||
    error?.name === 'CanceledError' ||
    error?.name === 'AbortError'
  );
}

export function getApiErrorMessage(error, defaultMessage = 'Không thể tải dữ liệu từ máy chủ.') {
  if (error?.response) {
    const serverMessage = error.response.data?.message;
    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      return serverMessage.trim();
    }
    if (error.response.status === 404) {
      return 'Không tìm thấy sản phẩm yêu cầu.';
    }
    if (error.response.status === 400) {
      return 'Tham số truy vấn không hợp lệ.';
    }
  }
  if (error?.request) {
    return 'Không thể kết nối đến máy chủ Spring Boot. Vui lòng kiểm tra backend (cổng 8080) và thử lại.';
  }
  return error?.message || defaultMessage;
}

export const catalogApi = {
  getLaptops: async (filters = {}, options = {}) => {
    const params = {};
    if (filters.keyword && filters.keyword.trim()) {
      params.keyword = filters.keyword.trim();
    }
    if (filters.brandId) {
      params.brandId = Number(filters.brandId);
    }
    if (filters.categoryId) {
      params.categoryId = Number(filters.categoryId);
    }
    if (filters.priceRange) {
      params.priceRange = filters.priceRange;
    }
    if (filters.minPrice != null && filters.minPrice !== '') {
      params.minPrice = filters.minPrice;
    }
    if (filters.maxPrice != null && filters.maxPrice !== '') {
      params.maxPrice = filters.maxPrice;
    }
    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
    }

    const response = await axiosClient.get('/laptops', {
      params,
      signal: options.signal,
    });
    const rawList = extractArrayPayload(response.data, 'danh sách laptop');
    return rawList.map(normalizeLaptop);
  },

  getLaptopById: async (id, options = {}) => {
    const response = await axiosClient.get(`/laptops/${id}`, {
      signal: options.signal,
    });
    const rawObject = extractObjectPayload(response.data, 'chi tiết laptop');
    return normalizeLaptop(rawObject);
  },

  getBrands: async (options = {}) => {
    const response = await axiosClient.get('/brands', {
      signal: options.signal,
    });
    const rawList = extractArrayPayload(response.data, 'thương hiệu');
    return rawList.map(normalizeTaxonomyItem);
  },

  getCategories: async (options = {}) => {
    const response = await axiosClient.get('/categories', {
      signal: options.signal,
    });
    const rawList = extractArrayPayload(response.data, 'danh mục');
    return rawList.map(normalizeTaxonomyItem);
  },
};
