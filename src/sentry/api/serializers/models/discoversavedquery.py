from datetime import timedelta

from django.utils import timezone

from sentry import quotas
from sentry.api.serializers import Serializer, register, serialize
from sentry.api.serializers.models.user import UserSerializer
from sentry.constants import ALL_ACCESS_PROJECTS
from sentry.discover.models import DiscoverSavedQuery
from sentry.utils.dates import parse_timestamp


@register(DiscoverSavedQuery)
class DiscoverSavedQuerySerializer(Serializer):
    def serialize(self, obj, attrs, user, **kwargs):
        query_keys = [
            "environment",
            "query",
            "fields",
            "widths",
            "conditions",
            "aggregations",
            "range",
            "start",
            "end",
            "orderby",
            "limit",
            "yAxis",
            "display",
        ]
        data = {
            "id": str(obj.id),
            "name": obj.name,
            "projects": [project.id for project in obj.projects.all()],
            "version": obj.version or obj.query.get("version", 1),
            "expired": False,
            "dateCreated": obj.date_created,
            "dateUpdated": obj.date_updated,
            "createdBy": serialize(obj.created_by, serializer=UserSerializer())
            if obj.created_by
            else None,
        }

        for key in query_keys:
            if obj.query.get(key) is not None:
                data[key] = obj.query[key]

        # expire queries that are beyond the retention period
        retention = quotas.get_event_retention(organization=obj.organization)
        if retention and "start" in obj.query:
            start, end = parse_timestamp(obj.query["start"]), parse_timestamp(obj.query["end"])
            start = max(start, timezone.now() - timedelta(days=retention))
            data["expired"] = start > end

        if obj.query.get("all_projects"):
            data["projects"] = list(ALL_ACCESS_PROJECTS)

        return data
