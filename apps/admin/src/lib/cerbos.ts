// apps/admin-portal/src/lib/cerbos.ts
import { GRPC } from '@cerbos/grpc';

// The Cerbos PDP instance
const cerbos = new GRPC('localhost:3593', {
  tls: false,
});

export default cerbos;
