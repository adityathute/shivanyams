from django.utils import timezone

from .models import EditorialNotification


def notify_editorial_user(recipient_auth_id, event_type, title, message, *, actor_auth_id="", post=None, action_url="", dedupe_key=None):
    recipient = str(recipient_auth_id or "").strip()
    if not recipient:
        return None
    if actor_auth_id and recipient == str(actor_auth_id):
        return None
    notification, _ = EditorialNotification.objects.get_or_create(
        dedupe_key=dedupe_key,
        defaults={
            "recipient_auth_id": recipient,
            "actor_auth_id": str(actor_auth_id or ""),
            "post": post,
            "event_type": event_type,
            "title": title[:180],
            "message": message,
            "action_url": action_url[:500],
        },
    ) if dedupe_key else (EditorialNotification.objects.create(
        recipient_auth_id=recipient,
        actor_auth_id=str(actor_auth_id or ""),
        post=post,
        event_type=event_type,
        title=title[:180],
        message=message,
        action_url=action_url[:500],
    ), True)
    return notification


def notify_assignment_deadlines(now=None, window_hours=24):
    now = now or timezone.now()
    from datetime import timedelta
    from .models import PostAssignment

    due = PostAssignment.objects.select_related("post").filter(
        status__in=[PostAssignment.Status.ASSIGNED, PostAssignment.Status.IN_PROGRESS],
        due_at__isnull=False,
        due_at__lte=now + timedelta(hours=window_hours),
    )
    created = 0
    for assignment in due.iterator():
        overdue = assignment.due_at < now
        label = "overdue" if overdue else "due soon"
        item = notify_editorial_user(
            assignment.assigned_to_auth_id,
            "assignment_overdue" if overdue else "assignment_due",
            f"Assignment {label}: {assignment.post.title_en}",
            f'The editorial task "{assignment.post.title_en}" is {label}. Please review its deadline.',
            post=assignment.post,
            action_url=f"/admin/edit-post/{assignment.post.category.slug}/{assignment.post.slug}",
            dedupe_key=f"assignment-deadline:{assignment.pk}:{assignment.due_at.isoformat()}",
        )
        created += int(item is not None)
    return created
