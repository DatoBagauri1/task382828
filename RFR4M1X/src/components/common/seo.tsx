import { Helmet } from 'react-helmet-async';

type SEOProps = {
  title: string;
  description: string;
  image?: string;
};

export const SEO = ({ title, description, image = '/brand-logo.png' }: SEOProps) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
  </Helmet>
);
