from django.core.urlresolvers import reverse
from django.test.utils import override_settings

from sentry.testutils import APITestCase


class PromptsActivityTest(APITestCase):
    def setUp(self):
        super().setUp()
        self.login_as(user=self.user)
        self.org = self.create_organization(owner=self.user, name="baz")
        # self.project = self.create_project(
        #     organization=self.org,
        #     # teams=[self.team],
        #     # name='Bengal-Elephant-Giraffe-Tree-House',
        # )

        self.team = self.create_team(organization=self.org, name="Mariachi Band")
        self.project = self.create_project(
            organization=self.org, teams=[self.team], name="Bengal-Elephant-Giraffe-Tree-House"
        )
        self.path = reverse("sentry-api-0-prompts-activity")

    @override_settings(DEMO_MODE=False)
    def test_invalid_feature(self):
        # Invalid feature prompt name
        resp = self.client.put(
            self.path,
            {
                "organization_id": self.org.id,
                "project_id": self.project.id,
                "feature": "gibberish",
                "status": "dismissed",
            },
        )

        assert resp.status_code == 400

    @override_settings(DEMO_MODE=False)
    def test_invalid_project(self):
        # Invalid project id
        data = {
            "organization_id": self.org.id,
            "project_id": self.project.id,
            "feature": "releases",
        }
        resp = self.client.get(self.path, data)
        assert resp.status_code == 200
        self.project.delete()
        # project doesn't exist
        resp = self.client.put(
            self.path,
            {
                "organization_id": self.org.id,
                "project_id": self.project.id,
                "feature": "releases",
                "status": "dismissed",
            },
        )
        assert resp.status_code == 400

    @override_settings(DEMO_MODE=False)
    def test_dismiss(self):
        data = {
            "organization_id": self.org.id,
            "project_id": self.project.id,
            "feature": "releases",
        }
        resp = self.client.get(self.path, data)
        assert resp.status_code == 200
        assert resp.data == {}

        self.client.put(
            self.path,
            {
                "organization_id": self.org.id,
                "project_id": self.project.id,
                "feature": "releases",
                "status": "dismissed",
            },
        )

        resp = self.client.get(self.path, data)
        assert resp.status_code == 200
        assert "data" in resp.data
        assert "dismissed_ts" in resp.data["data"]

    @override_settings(DEMO_MODE=False)
    def test_snooze(self):
        data = {
            "organization_id": self.org.id,
            "project_id": self.project.id,
            "feature": "releases",
        }
        resp = self.client.get(self.path, data)
        assert resp.status_code == 200
        assert resp.data == {}

        self.client.put(
            self.path,
            {
                "organization_id": self.org.id,
                "project_id": self.project.id,
                "feature": "releases",
                "status": "snoozed",
            },
        )

        resp = self.client.get(self.path, data)

        assert resp.status_code == 200
        assert "data" in resp.data
        assert "snoozed_ts" in resp.data["data"]
