// pages/[...slug].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import routes from '../app/routes';

const Loader = () => <div>Loading...</div>;

export default function DynamicPage() {
  const [DynamicComponent, setDynamicComponent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    if (router.query.slug) {
      const slug = Array.isArray(router.query.slug) ? router.query.slug : [router.query.slug];
      const matchingRoute = routes.find((route: any) => route.path === `/${slug.join('/')}`);
      if (matchingRoute) {
        const component = dynamic(import(`../app/${matchingRoute.componentPath}`), { loading: () => <Loader /> });
        setDynamicComponent(() => component);
      } else {
        // handle 404 error
        const NotFoundComponent = dynamic(import('../pages/'), { loading: () => <Loader /> });
        setDynamicComponent(() => NotFoundComponent);
      }
    }
    setLoading(false);
  }, [router.query]);

  if (loading) {
    return <Loader />;
  }

  return DynamicComponent ? <DynamicComponent /> : null;
}
