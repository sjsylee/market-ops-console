import { mockApiRoute } from '../../../lib/mock-data';

type RouteContext = {
  params: {
    mock?: string[];
  };
};

export function GET(request: Request, context: RouteContext) {
  return mockApiRoute(request, context.params.mock);
}

export function POST(request: Request, context: RouteContext) {
  return mockApiRoute(request, context.params.mock);
}

export function PATCH(request: Request, context: RouteContext) {
  return mockApiRoute(request, context.params.mock);
}

export function DELETE(request: Request, context: RouteContext) {
  return mockApiRoute(request, context.params.mock);
}
