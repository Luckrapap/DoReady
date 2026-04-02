package com.doready.app;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable Edge-to-Edge (Essential for Android 14/15)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        // Reset status and navigation bars to full transparency
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        // FORCE WebView to follow system theme at the ROM level
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();
        
        // Force hardware to report correct color scheme to matchMedia
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            settings.setForceDark(WebSettings.FORCE_DARK_AUTO);
        }
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            settings.setAlgorithmicDarkeningAllowed(true);
        }
        
        registerPlugin(SystemThemePlugin.class);
    }
}
