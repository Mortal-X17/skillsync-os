package com.skillsync.os;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.view.View;
import android.view.Window;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

/**
 * Mirrors the SkillSync in-app theme onto the Android window: transparent
 * edge-to-edge system bars with the correct icon contrast, plus a matching
 * window background so no flash of the wrong colour appears at launch.
 *
 * The OS colour scheme is never read — SkillSync's own Theme setting is the
 * single source of truth. The last used theme is cached in SharedPreferences so
 * the very first frame after a cold start is already correct.
 */
final class ThemeController {

    private static final String PREFS = "skillsync_theme";
    private static final String KEY_THEME = "theme";
    private static final String KEY_BACKGROUND = "background";

    private static final int DARK_BG = 0xFF070B19;
    private static final int LIGHT_BG = 0xFFFBFAF8;

    private ThemeController() {}

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    /** "light" or "dark" — defaults to dark (SkillSync's signature theme). */
    static String stored(Context context) {
        return "light".equals(prefs(context).getString(KEY_THEME, "dark")) ? "light" : "dark";
    }

    static void store(Context context, String theme, Integer background) {
        SharedPreferences.Editor editor = prefs(context).edit();
        editor.putString(KEY_THEME, "light".equals(theme) ? "light" : "dark");
        if (background != null) editor.putInt(KEY_BACKGROUND, background);
        editor.apply();
    }

    private static int background(Context context, String theme) {
        int fallback = "light".equals(theme) ? LIGHT_BG : DARK_BG;
        return prefs(context).getInt(KEY_BACKGROUND, fallback);
    }

    /** Applies the given theme to the activity window. Must run on the UI thread. */
    static void apply(Activity activity, String theme) {
        if (activity == null) return;
        boolean light = "light".equals(theme);
        Window window = activity.getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        View decor = window.getDecorView();
        decor.setBackgroundColor(background(activity, theme));

        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(window, decor);
        // Light theme -> dark icons; dark theme -> light icons.
        controller.setAppearanceLightStatusBars(light);
        controller.setAppearanceLightNavigationBars(light);
    }

    /** Cold-start path: apply whatever the user last chose. */
    static void applyStored(Activity activity) {
        apply(activity, stored(activity));
    }

    static int parseColor(String value, String theme) {
        try {
            if (value != null && value.startsWith("#")) return Color.parseColor(value);
        } catch (IllegalArgumentException ignored) {
            // fall through to the theme default
        }
        return "light".equals(theme) ? LIGHT_BG : DARK_BG;
    }
}
