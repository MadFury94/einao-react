import { isRouteErrorResponse, Link, useRouteError } from "react-router";
export function BlogError() {
  const error = useRouteError();
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return <main style={{ padding: '160px 24px 80px', maxWidth: 900, margin: 'auto' }}><h1>{missing ? 'Insight not found' : 'Insights are temporarily unavailable'}</h1><p>{missing ? 'This article or page may no longer be published.' : 'Please try again shortly.'}</p><Link to="/insights/">Back to insights</Link></main>;
}
