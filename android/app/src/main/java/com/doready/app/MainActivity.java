package com.doready.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable Edge-to-Edge (Transparent status and navigation bars)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        registerPlugin(SystemThemePlugin.class);
    }
}
