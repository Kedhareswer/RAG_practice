/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for Transformer.js
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      ...(isServer ? {} : { 'onnxruntime-node$': false }),
    };

    // Avoid bundling Node core modules on client
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    // Handle ONNX files
    config.module.rules.push({
      test: /\.onnx$/,
      type: 'asset/resource',
    });

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth', 'xlsx', '@xenova/transformers', 'onnxruntime-web'],
  },
};

export default nextConfig;
