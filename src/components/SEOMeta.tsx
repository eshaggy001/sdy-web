import { Helmet } from 'react-helmet-async';

interface SEOMetaProps {
  title: string;
  description: string;
  image?: string;
  path?: string;
}

const BASE_URL = 'https://sdy-web.vercel.app';
const DEFAULT_IMAGE = `${BASE_URL}/og-default.jpg`;

export const SEOMeta = ({ title, description, image, path = '' }: SEOMetaProps) => {
  const fullTitle = `${title} | SDY`;
  const url = `${BASE_URL}${path}`;
  const ogImage = image ?? DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type"        content="website" />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:url"         content={url} />
      <meta property="og:site_name"   content="SDY Mongolia" />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />
    </Helmet>
  );
};
