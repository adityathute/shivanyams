# API filtering and search review

## Existing global configuration

Django REST Framework has global backends configured for:

- `DjangoFilterBackend`
- `SearchFilter`
- `OrderingFilter`

This makes the backends available, but does not automatically make every field searchable or filterable. A view must declare `filterset_fields` / `filterset_class`, `search_fields`, and `ordering_fields` as appropriate.

## Existing endpoint behavior

- Public content querysets are already scoped to one active category and published, active posts with a publication timestamp.
- Admin content querysets are scoped to the selected category.
- The current global pagination and filter backends do not define a consistent public/admin filter contract by themselves.
- Analytics endpoints have their own query-parameter handling and should not inherit arbitrary model-field ordering.

## Recommended API contract

Public content:
- Search only approved public-facing fields such as English title, summary, and canonical slug.
- Keep category, publication status, and active-state restrictions server-enforced.
- Permit ordering only by a small allowlist such as publication date and creation date.
- Never allow clients to override public visibility filters.

Admin content:
- Support explicit status, featured, and language filters.
- Search title and slug fields.
- Allow ordering only by reviewed fields and keep a stable tie-breaker.
- Validate query parameter types and reject unsupported values consistently.

## Compatibility note

Search and filter parameters should be additive. Existing endpoint paths, default ordering, and response field names should remain unchanged. Do not expose internal fields such as owner IDs or moderation notes through public search.

No view queryset or API parameter contract was changed in this review; a route-by-route contract should be implemented with the relevant admin/public permissions and frontend consumers in view.
