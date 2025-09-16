import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import I18n from "discourse-i18n";  // Import I18n if needed for custom titles, but use keys directly

function registerTopicFooterButtons(api, container, siteSettings) {
  api.registerTopicFooterButton({
    id: "privatereplies",
    icon() {
      return "reply";
    },
    priority: 250,  // Or increase to 300+ if you want it at the very end
    title() {
      return "topic.reply.help";  // Matches default i18n key for tooltip
    },
    label() {
      return "topic.reply.title";  // Matches default i18n key for "Reply" text
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
      return false;  // Always inline, like the default reply button
    },
    classNames: ["btn-primary", "create", "topic-footer-button"],  // Exact classes from default
    displayed() {
      // Show button for all logged-in users
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
        // Hide the main Reply button in the timeline (secondary button)
        const replyButton = document.querySelector('.timeline-container .topic-timeline .reply-to-post');
        if (replyButton) {
          replyButton.style.display = 'none';
        }
        
        // Hide default Reply buttons in the topic controls, but skip the plugin button
        const topicReplyButtons = document.querySelectorAll('.topic-footer-main-buttons .btn-primary');
        topicReplyButtons.forEach(button => {
          if (button.textContent.trim().includes('Reply') && button.id !== 'privatereplies') {
            button.style.display = 'none';
          }
        });
      });
    });
  }
};
