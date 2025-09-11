import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

function registerTopicFooterButtons(api, container, siteSettings) {
  api.registerTopicFooterButton({
    id: "privatereplies",
    icon() {
      return "envelope";
    },
    priority: 250,
    title() {
      return "private_replies.button.private_replies.help";
    },
    label() {
      return "private_replies.button.private_replies.button";
    },
    action() {
      // Get topic owner's email or use a default
      const topicOwner = this.get("topic.details.created_by");
      const email = topicOwner?.email || "someone@example.com";
      const subject = `Re: ${this.get("topic.title")}`;
      
      // Open Gmail with mailto link
      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
      window.open(mailtoLink, '_blank');
    },
    dropdown() {
      return this.site.mobileView;
    },
    classNames: ["private-replies"],
    displayed() {
      // Show email button for all logged-in users
      return this.currentUser;
    }
  });
}

export default {
  name: "extend-for-privatereplies",
  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    if (!siteSettings.private_replies_enabled) {
      return;
    }

    withPluginApi("0.8.28", api => registerTopicFooterButtons(api, container, siteSettings));
  }
};
