package com.doready.app;

import android.graphics.Color;
import android.os.Bundle;
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
        
        registerPlugin(SystemThemePlugin.class);
    }
}
