package com.skillsync.os;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import org.json.JSONObject;

/**
 * Fires a stored reminder. Runs even when SkillSync is fully closed, then
 * re-arms itself for recurring reminders.
 */
public class ReminderReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String id = intent.getStringExtra(ReminderScheduler.EXTRA_ID);
        if (id == null) return;

        JSONObject reminder = ReminderStore.get(context, id);
        String title = reminder != null ? reminder.optString("title", "SkillSync") : "SkillSync";
        String body = reminder != null ? reminder.optString("body", "") : "";
        String url = reminder != null
                ? reminder.optString("url", "/notifications")
                : intent.getStringExtra(ReminderScheduler.EXTRA_URL);
        String priority = reminder != null ? reminder.optString("priority", "normal") : "normal";
        String repeat = reminder != null ? reminder.optString("repeat", "none") : "none";

        ReminderScheduler.show(context, id, title, body, url, priority);

        if (reminder == null) return;
        if ("none".equals(repeat)) {
            ReminderStore.remove(context, id);
            return;
        }
        long next = ReminderScheduler.nextOccurrence(
                reminder.optLong("at", System.currentTimeMillis()),
                repeat,
                System.currentTimeMillis());
        try {
            reminder.put("at", next);
        } catch (org.json.JSONException ignored) {
            return;
        }
        ReminderScheduler.schedule(context, reminder);
    }
}
