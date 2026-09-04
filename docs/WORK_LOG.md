# [유자를 품은 오란다&까부리] 작업 내역 및 변경 기록 (Work Log)

본 문서는 프로젝트의 작업 이력과 변경 사항을 상세하게 추적하고 관리하기 위한 작업 일지입니다.

---

## [2026-09-04] 관리자/생산자 시스템 전면 고도화 및 DB 이관

- **작업자**: Antigravity Pair Programmer
- **요청 사항**:
  1. 랜딩 페이지 독립성 보장 (소비자 전용, 관리자/생산자 접속 경로 원천 차단)
  2. 생산자/작업자 및 관리자 페이지 분리 및 재고/주문/단가 전면 개편
  3. 모든 데이터 하드코딩 제거 및 Supabase DB 5개 테이블로 이관
  4. 디자인 시스템 공통화 및 컴포넌트 재활용 체계 구축
  5. 설계, 지침, 작업 내역 체계적 문서화

### 세부 작업 내역
1. **문서화 체계 수립**:
   - `docs/SYSTEM_DESIGN.md`: 데이터베이스 모델, 계층 구조, 컴포넌트 아키텍처 작성
   - `docs/GUIDELINES.md`: 랜딩 독립성, 보안 접속, DB 운영, 배포 지침 작성
   - `docs/WORK_LOG.md`: 작업 내역 및 변경 이력 로깅
   - `supabase_schema.sql`: 원클릭 테이블 생성 및 초기 Seed 데이터 스키마 작성
2. **공통 컴포넌트 및 디자인 시스템 구축**:
   - `lib/inventoryCommon.js`: 원재료-상품-완제품 공통 비즈니스 로직 및 Seed 데이터
   - `components/common/DataTable.jsx`: 검색, 필터, 정렬, 추가 버튼을 갖춘 반응형 테이블
   - `components/common/ModalPopup.jsx`: 팝업 모달
   - `components/common/StockBadge.jsx`: 4단계 재고 상태 뱃지
   - `components/common/RecentLogViewer.jsx`: 인라인 최근 변경 이력 뷰어
3. **Supabase 클라이언트 고도화**:
   - `app/supabaseClient.js`: `raw_materials`, `products`, `finished_goods`, `inventory_logs`, `orders` REST API 연동 및 오프라인 로컬 Fallback 완벽 동기화
4. **생산자/작업자 페이지 개편 (`app/producer/`)**:
   - 좌측: 원재료 재고 관리, 상품 낱개 생산량, 완제품 세트 생산량 조절, 인라인 최근 변동 내역 표시, [작업 내역 일괄 저장] (사유 입력 팝업)
   - 우측 사이드바: 최근 변경 내역(재고 기록) 리스트, 클릭 시 수정/삭제 팝업
5. **관리자 페이지 개편 (`app/admin/`)**:
   - 5대 테이블 뷰 구축 (주문 관리, 완제품 관리, 상품 관리, 원재료 관리, 변경 내역)
   - 상단 통합 검색/필터/정렬/추가 조작부
   - 팝업 모달 기반의 모든 항목 추가 및 수정
   - 원재료 관리 화면에서 금액/단가 필드 숨김 처리
   - 단가 계산기 부가 기능: DB 연동 실시간 마진율/원가 시뮬레이션
   - 랜딩페이지 설정 부가 기능: 독립 보존
6. **품질 검증 및 배포 준비**:
   - Next.js 빌드 무결성 검증 통과
   - GitHub 커밋 및 푸시
