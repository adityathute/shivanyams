# Serializer validation review

## Existing validation

The current serializers already contain domain-specific validation in several places:

- `PostDateSerializer` builds a candidate model and calls its `clean()` method.
- `JobPostSerializer` calls `JobPost.clean()` and checks duplicate fee categories.
- `JobDetailsSerializer` validates candidate job details and rejects duplicate post numbers in a submitted nested collection.
- Nested job post, fee, education, and vacancy-breakdown writes are wrapped in atomic serializer methods.
- Comment creation validates the parent comment's post and approval status and enforces a maximum nesting depth in the API view.

## Remaining concerns

1. Validation coverage is uneven across the category-specific detail serializers; several currently rely on generated ModelSerializer field validation.
2. Model `clean()` is not automatically called by Django's normal `save()` method.
3. JSON fields need explicit expected-shape validation at serializer boundaries.
4. Partial updates must validate the effective candidate state, not only submitted fields.
5. Nested relation IDs must be checked against the parent post and the intended ownership boundary.
6. Uniqueness checks in serializers are user-friendly but database constraints remain the final concurrency-safe protection.

## Safe validation strategy

- Keep field-level validation close to the serializer field.
- Put cross-field business rules in reusable validators or domain services.
- Build candidate state from existing instance values plus submitted changes for PATCH operations.
- Convert Django `ValidationError` into DRF validation errors without leaking internal exceptions.
- Keep database constraints for race-safe uniqueness and referential integrity.
- Do not introduce blanket `full_clean()` calls on every save without checking nested serializer and admin write behavior.

No serializer behavior was changed in this audit. The identified gaps should be addressed in focused follow-up changes with explicit request/response compatibility.
