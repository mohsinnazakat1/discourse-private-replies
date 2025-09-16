import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

function registerTopicFooterButtons(api, container, siteSettings) {
  api.registerTopicFooterButton({
    id: "privatereplies",
    icon() {
      return "reply";
    },
    priority: 250,
    title() {
      return "Reply to this topic";
    },
    label() {
      return "Reply";
    },
    async action() {
      const topicOwner = this.get("topic.details.created_by");
      
      try {
        // Fetch user details including email via API
        const userDetails = await ajax(`/u/${topicOwner.username}.json`);
        const email = userDetails.user?.email || "someone@example.com";
        
        const subject = `Re: ${this.get("topic.title")}`;
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
        window.open(mailtoLink, '_blank');
      } catch (error) {
        popupAjaxError(error);
        // Fallback to default email if API call fails
        const subject = `Re: ${this.get("topic.title")}`;
        const mailtoLink = `mailto:someone@example.com?subject=${encodeURIComponent(subject)}`;
        window.open(mailtoLink, '_blank');
      }
    },
    dropdown() {
      return this.site.mobileView;
    },
    classNames: ["btn-primary"],
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

    withPluginApi("0.8.28", api => {
      registerTopicFooterButtons(api, container, siteSettings);
      api.onPageChange(() => {
        // Hide the main Reply button at the bottom of topics
        const replyButton = document.querySelector('.timeline-container .topic-timeline .reply-to-post');
        if (replyButton) {
          replyButton.style.display = 'none';
        }
        
        // Hide Reply buttons in the topic controls
        const topicReplyButtons = document.querySelectorAll('.topic-footer-main-buttons .btn-primary');
        topicReplyButtons.forEach(button => {
          if (button.textContent.trim().includes('Reply')) {
            button.style.display = 'none';
          }
        });
      });
    });
  }
};
