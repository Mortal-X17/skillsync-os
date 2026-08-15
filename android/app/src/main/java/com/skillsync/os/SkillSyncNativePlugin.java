package com.skillsync.os;

import android.Manifest;
import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * SkillSync's native bridge: real Android haptics and OS-level local
 * notifications. The web app calls this through src/lib/native/bridge.ts and
 * falls back to browser APIs when the plugin is absent.
 */
@CapacitorPlugin(
        name = "SkillSyncNative",
        permissions = {
                @Permission(alias = "notifications", strings = {"android.permission.POST_NOTIFICATIONS"})
        }
)
public class SkillSyncNativePlugin extends Plugin {

    /* ------------------------------ capabilities ---------------------------- */

    @PluginMethod
    public void capabilities(PluginCall call) {
        JSObject result = new JSObject();
        result.put("native", true);
        result.put("platform", "android");
        result.put("sdk", Build.VERSION.SDK_INT);
        result.put("haptics", hasVibrator());
        result.put("amplitudeControl", Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                && vibrator() != null && vibrator().hasAmplitudeControl());
        result.put("canSchedule", true);
        result.put("exactAlarms", ReminderScheduler.canScheduleExact(getContext()));
        result.put("notificationsEnabled",
                NotificationManagerCompat.from(getContext()).areNotificationsEnabled());
        result.put("permission", permissionValue());
        result.put("scheduledCount", ReminderStore.list(getContext()).size());
        call.resolve(result);
    }

    /* ------------------------------- haptics ------------------------------- */

    private Vibrator vibrator() {
        Context context = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager manager =
                    (VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            return manager == null ? null : manager.getDefaultVibrator();
        }
        return (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
    }

    private boolean hasVibrator() {
        Vibrator v = vibrator();
        return v != null && v.hasVibrator();
    }

    /** vibrate({ duration, amplitude }) — a single pulse. */
    @PluginMethod
    public void vibrate(PluginCall call) {
        int duration = call.getInt("duration", 20);
        int amplitude = call.getInt("amplitude", -1);
        Vibrator v = vibrator();
        if (v == null || !v.hasVibrator()) {
            call.resolve(ok(false));
            return;
        }
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                int amp = amplitude > 0 && v.hasAmplitudeControl()
                        ? Math.min(255, amplitude)
                        : VibrationEffect.DEFAULT_AMPLITUDE;
                v.vibrate(VibrationEffect.createOneShot(Math.max(1, duration), amp));
            } else {
                v.vibrate(Math.max(1, duration));
            }
            call.resolve(ok(true));
        } catch (Exception e) {
            call.resolve(ok(false));
        }
    }

    /** vibratePattern({ pattern: [wait, on, wait, on, ...] }). */
    @PluginMethod
    public void vibratePattern(PluginCall call) {
        JSArray raw = call.getArray("pattern");
        Vibrator v = vibrator();
        if (raw == null || v == null || !v.hasVibrator()) {
            call.resolve(ok(false));
            return;
        }
        try {
            java.util.List<Integer> values = raw.toList();
            long[] pattern = new long[values.size() + 1];
            pattern[0] = 0;
            for (int i = 0; i < values.size(); i++) {
                pattern[i + 1] = Math.max(0, values.get(i).longValue());
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                v.vibrate(VibrationEffect.createWaveform(pattern, -1));
            } else {
                v.vibrate(pattern, -1);
            }
            call.resolve(ok(true));
        } catch (Exception e) {
            call.resolve(ok(false));
        }
    }

    /**
     * haptic({ level }) — semantic feedback mapped to platform primitives.
     * Levels: selection, light, medium, heavy, success, warning, error, milestone.
     */
    @PluginMethod
    public void haptic(PluginCall call) {
        String level = call.getString("level", "light");
        Vibrator v = vibrator();
        if (v == null || !v.hasVibrator()) {
            call.resolve(ok(false));
            return;
        }
        long[] pattern;
        switch (level == null ? "light" : level) {
            case "selection": pattern = new long[]{0, 8}; break;
            case "medium": pattern = new long[]{0, 22}; break;
            case "heavy": pattern = new long[]{0, 40}; break;
            case "success": pattern = new long[]{0, 14, 45, 26}; break;
            case "warning": pattern = new long[]{0, 24, 60, 24}; break;
            case "error": pattern = new long[]{0, 30, 50, 30, 50, 30}; break;
            case "milestone": pattern = new long[]{0, 16, 40, 22, 40, 38}; break;
            default: pattern = new long[]{0, 12}; break;
        }
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                v.vibrate(VibrationEffect.createWaveform(pattern, -1));
            } else {
                v.vibrate(pattern, -1);
            }
            call.resolve(ok(true));
        } catch (Exception e) {
            call.resolve(ok(false));
        }
    }

    /* ----------------------------- permissions ----------------------------- */

    private String permissionValue() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            boolean granted = getPermissionState("notifications")
                    == com.getcapacitor.PermissionState.GRANTED;
            if (!granted) {
                return getPermissionState("notifications")
                        == com.getcapacitor.PermissionState.DENIED ? "denied" : "default";
            }
        }
        return NotificationManagerCompat.from(getContext()).areNotificationsEnabled()
                ? "granted" : "denied";
    }

    @PluginMethod
    public void checkNotificationPermission(PluginCall call) {
        JSObject result = new JSObject();
        result.put("permission", permissionValue());
        call.resolve(result);
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                && getPermissionState("notifications") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "notificationPermissionCallback");
            return;
        }
        ReminderScheduler.ensureChannel(getContext());
        JSObject result = new JSObject();
        result.put("permission", permissionValue());
        call.resolve(result);
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        ReminderScheduler.ensureChannel(getContext());
        JSObject result = new JSObject();
        result.put("permission", permissionValue());
        call.resolve(result);
    }

    /* ---------------------------- notifications ---------------------------- */

    /** notify({ id, title, body, url, priority }) — show immediately. */
    @PluginMethod
    public void notify(PluginCall call) {
        String id = call.getString("id", "instant-" + System.currentTimeMillis());
        boolean shown = ReminderScheduler.show(
                getContext(),
                id,
                call.getString("title", "SkillSync"),
                call.getString("body", ""),
                call.getString("url", "/notifications"),
                call.getString("priority", "normal"));
        call.resolve(ok(shown));
    }

    /** schedule({ id, title, body, at, repeat, url, priority }). */
    @PluginMethod
    public void schedule(PluginCall call) {
        String id = call.getString("id");
        if (id == null || id.isEmpty()) {
            call.reject("schedule() requires an id");
            return;
        }
        JSONObject reminder = new JSONObject();
        try {
            reminder.put("id", id);
            reminder.put("title", call.getString("title", "SkillSync"));
            reminder.put("body", call.getString("body", ""));
            reminder.put("at", call.getLong("at", System.currentTimeMillis() + 60000L));
            reminder.put("repeat", call.getString("repeat", "none"));
            reminder.put("url", call.getString("url", "/notifications"));
            reminder.put("priority", call.getString("priority", "normal"));
        } catch (JSONException e) {
            call.reject("invalid reminder payload");
            return;
        }
        long at = ReminderScheduler.schedule(getContext(), reminder);
        JSObject result = new JSObject();
        result.put("ok", true);
        result.put("id", id);
        result.put("at", at);
        result.put("exact", ReminderScheduler.canScheduleExact(getContext()));
        call.resolve(result);
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        String id = call.getString("id");
        if (id != null) ReminderScheduler.cancel(getContext(), id);
        call.resolve(ok(true));
    }

    @PluginMethod
    public void cancelAll(PluginCall call) {
        ReminderScheduler.cancelAll(getContext());
        call.resolve(ok(true));
    }

    @PluginMethod
    public void listScheduled(PluginCall call) {
        JSArray items = new JSArray();
        for (JSONObject reminder : ReminderStore.list(getContext())) {
            items.put(reminder);
        }
        JSObject result = new JSObject();
        result.put("scheduled", items);
        call.resolve(result);
    }

    /** Route requested by a notification tap, consumed once by the web app. */
    @PluginMethod
    public void takePendingRoute(PluginCall call) {
        JSObject result = new JSObject();
        result.put("route", MainActivity.takePendingRoute());
        call.resolve(result);
    }

    private JSObject ok(boolean value) {
        JSObject result = new JSObject();
        result.put("ok", value);
        return result;
    }
}
