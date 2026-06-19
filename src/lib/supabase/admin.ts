import { createClient as createSbClient } from '@supabase/supabase-js'

// service_role 키를 사용해 RLS를 우회한다.
// 절대 클라이언트(브라우저)에서 호출하지 말고, 관리자 권한이 이미 검증된 서버 코드에서만 사용한다.
export function createAdminClient() {
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
