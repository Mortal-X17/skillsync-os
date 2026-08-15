package com.skillsync.os;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Tiny offline store for scheduled reminders.
 *
 * Reminders must survive process death and device reboots, so the payload each
 * alarm needs is persisted here as JSON (SharedPreferences). Nothing ever
 * leaves the device.
 */
final class ReminderStore {
    private static final String PREFS = "skillsync_reminders";
    private static final String KEY = "items";

    private ReminderStore() {}

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static JSONObject all(Context context) {
        String raw = prefs(context).getString(KEY, "{}");
        try {
            return new JSONObject(raw);
        } catch (JSONException e) {
            return new JSONObject();
        }
    }

    static List<JSONObject> list(Context context) {
        JSONObject root = all(context);
        List<JSONObject> out = new ArrayList<>();
        for (Iterator<String> it = root.keys(); it.hasNext(); ) {
            JSONObject item = root.optJSONObject(it.next());
            if (item != null) out.add(item);
        }
        return out;
    }

    static void put(Context context, JSONObject reminder) {
        String id = reminder.optString("id", null);
        if (id == null || id.isEmpty()) return;
        JSONObject root = all(context);
        try {
            root.put(id, reminder);
        } catch (JSONException ignored) {
            return;
        }
        prefs(context).edit().putString(KEY, root.toString()).apply();
    }

    static JSONObject get(Context context, String id) {
        return all(context).optJSONObject(id);
    }

    static void remove(Context context, String id) {
        JSONObject root = all(context);
        root.remove(id);
        prefs(context).edit().putString(KEY, root.toString()).apply();
    }

    static void clear(Context context) {
        prefs(context).edit().remove(KEY).apply();
    }
}
