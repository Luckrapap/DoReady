package com.doready.app;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Context;
import android.content.SharedPreferences;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.view.accessibility.AccessibilityWindowInfo;
import java.util.List;

public class ShortsBlockerService extends AccessibilityService {

    private static final String PREFS_NAME = "BlockZonePrefs";
    private static final String KEY_ENABLED = "blocker_enabled";

    private long lastRedirectTime = 0;
    private long lastScanTime = 0;
    private static final long COOLDOWN_MS = 1500;
    private static final long SCAN_INTERVAL_MS = 300;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        try {
            if (!isBlockerEnabled()) return;

            CharSequence pkg = event.getPackageName();
            if (pkg == null || !pkg.toString().equals("com.google.android.youtube")) return;

            // Fast path: detect by event class name (works on many YouTube versions)
            CharSequence cls = event.getClassName();
            if (cls != null) {
                String clsLower = cls.toString().toLowerCase();
                if (clsLower.contains("reel") || clsLower.contains("shorts")) {
                    performBackIfCooldown();
                    return;
                }
            }

            long now = System.currentTimeMillis();
            if (no w - lastScanTime < SCAN_INTERVAL_MS) return;
            lastScanTime = now;

            AccessibilityNodeInfo root = null;
            try {
                root = getRootInActiveWindow();
                if (root == null) return;

                // Guard 1: keyboard window is open
                if (detectKeyboardWindow()) return;

                // Guard 2: a text field is focused
                if (isTextInputFocused(root)) return;

                if (isShortsPlayer(root)) {
                    performBackIfCooldown();
                }
            } finally {
                if (root != null) {
                    root.recycle();
                }
            }
        } catch (Throwable t) {
            // Ignorar errores para evitar que el servicio se detenga.
        }
    }

    private void performBackIfCooldown() {
        long now = System.currentTimeMillis();
        if (now - lastRedirectTime > COOLDOWN_MS) {
            lastRedirectTime = now;
            performGlobalAction(GLOBAL_ACTION_BACK);
        }
    }

    // ── DETECTION ────────────────────────────────────────────────────────────

    private boolean isShortsPlayer(AccessibilityNodeInfo root) {
        StringBuilder sb = new StringBuilder();
        collectContext(root, sb, 0);
        String ctx = sb.toString().toLowerCase();

        // 1. Structural IDs — Shorts/Reel PLAYER container (multiple YouTube versions)
        if (ctx.contains("shorts_player") || ctx.contains("reel_player") ||
            ctx.contains("shorts_video_player") || ctx.contains("reel_multi_player") ||
            ctx.contains("shorts_player_page") || ctx.contains("shorts_shelf") ||
            ctx.contains("reel_watch_fragment") || ctx.contains("shorts_standalone_player")) {
            return true;
        }

        // 2. Accessibility descriptions set by YouTube for Shorts player
        if (ctx.contains("reproductor de shorts") || ctx.contains("shorts player") ||
            ctx.contains("youtube shorts") || ctx.contains("reproduciendo shorts")) {
            return true;
        }

        // 3. Fragment/class names (pre-ProGuard or partially obfuscated builds)
        if (ctx.contains("reelwatchfragment") || ctx.contains("reelplayerfragment") ||
            ctx.contains("shortsplayer") || ctx.contains("shortsscreen") ||
            ctx.contains("reelscreen") || ctx.contains("shortsfragment")) {
            return true;
        }

        // 4. URL-style detection (some YouTube versions expose content URIs)
        if (ctx.contains("/shorts/")) {
            return true;
        }

        return false;
    }

    // ── GUARDS ───────────────────────────────────────────────────────────────

    /**
     * Returns true if the system keyboard window is present.
     * Works on most Android launchers/keyboards.
     */
    private boolean detectKeyboardWindow() {
        try {
            List<AccessibilityWindowInfo> windows = getWindows();
            if (windows == null) return false;
            for (AccessibilityWindowInfo w : windows) {
                if (w != null && w.getType() == AccessibilityWindowInfo.TYPE_INPUT_METHOD) return true;
            }
        } catch (Exception ignored) {}
        return false;
    }

    /**
     * Returns true if any editable text field is currently focused in the view tree.
     * This is the most reliable way to detect that the user is typing a comment or reply,
     * regardless of which keyboard is installed on the device.
     */
    private boolean isTextInputFocused(AccessibilityNodeInfo root) {
        // Check input focus (cursor inside a text field)
        AccessibilityNodeInfo focused = null;
        try {
            focused = root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
            if (focused != null && focused.isEditable()) return true;
        } catch (Exception ignored) {} 
        finally {
            if (focused != null) focused.recycle();
        }

        // Also look for any EditText that is focused anywhere in the tree
        return hasEditTextFocus(root, 0);
    }

    private boolean hasEditTextFocus(AccessibilityNodeInfo node, int depth) {
        if (node == null || depth > 20) return false;
        try {
            String cls = node.getClassName() != null ? node.getClassName().toString() : "";
            if (cls.contains("EditText") && (node.isFocused() || node.isAccessibilityFocused())) {
                return true;
            }
            int childCount = node.getChildCount();
            for (int i = 0; i < childCount; i++) {
                AccessibilityNodeInfo child = node.getChild(i);
                if (child != null) {
                    boolean focused = hasEditTextFocus(child, depth + 1);
                    child.recycle();
                    if (focused) return true;
                }
            }
        } catch (Exception e) {}
        return false;
    }

    // ── CONTEXT COLLECTOR ────────────────────────────────────────────────────

    private void collectContext(AccessibilityNodeInfo node, StringBuilder sb, int depth) {
        if (node == null || depth > 20) return;
        try {
            if (node.getText() != null)
                sb.append(" | ").append(node.getText().toString()).append(" | ");
            if (node.getContentDescription() != null)
                sb.append(" | ").append(node.getContentDescription().toString()).append(" | ");
            if (node.getViewIdResourceName() != null)
                sb.append(" | ").append(node.getViewIdResourceName()).append(" | ");
            if (node.getClassName() != null)
                sb.append(" | ").append(node.getClassName().toString()).append(" | ");
                
            int childCount = node.getChildCount();
            for (int i = 0; i < childCount; i++) {
                AccessibilityNodeInfo child = node.getChild(i);
                if (child != null) {
                    collectContext(child, sb, depth + 1);
                    child.recycle();
                }
            }
        } catch (Exception e) {}
    }

    // ── BOILERPLATE ──────────────────────────────────────────────────────────

    private boolean isBlockerEnabled() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getBoolean(KEY_ENABLED, true);
    }

    @Override
    public void onInterrupt() {}

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();

        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED |
                          AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED |
                          AccessibilityEvent.TYPE_WINDOWS_CHANGED |
                          AccessibilityEvent.TYPE_VIEW_SCROLLED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.flags = AccessibilityServiceInfo.DEFAULT |
                     AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS |
                     AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS |
                     AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS;
        info.notificationTimeout = 100;
        info.packageNames = new String[]{"com.google.android.youtube"};
        setServiceInfo(info);
    }


}
