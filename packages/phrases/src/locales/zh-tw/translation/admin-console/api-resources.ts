const api_resources = {
  page_title: 'API 資源',
  title: 'API 資源',
  subtitle: '定義可以從已授權的應用程序中使用的 API',
  create: '創建 API 資源',
  api_name: 'API 名稱',
  api_name_placeholder: '輸入API名稱',
  api_identifier: 'API Identifier',
  api_identifier_placeholder: 'https://your-api-identifier/',
  api_identifier_tip:
    '對於 API 資源的唯一標識符。它必須是一個絕對 URI，並沒有 fragment (#) 組件。等價於 OAuth 2.0 中的 <a>resource parameter</a>。',
  api_resource_created: ' API 資源 {{name}} 已成功創建。',
  default_api: 'Default API', // UNTRANSLATED
  default_api_label:
    'If the current API Resource is set as the default API for the tenant, while each tenant can have either 0 or 1 default API. When a default API is designated, the resource parameter can be omitted in the auth request. Subsequent token exchanges will use that API as the audience by default, resulting in the issuance of JWTs.', // UNTRANSLATED
};

export default api_resources;
