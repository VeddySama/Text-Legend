package com.textlegend.app

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.lifecycle.ViewModelProvider

class MainActivity : ComponentActivity() {
    private var downloadReceiver: BroadcastReceiver? = null
    private lateinit var vm: GameViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        vm = ViewModelProvider(this)[GameViewModel::class.java]
        setContent {
            TextLegendApp(vm = vm, activity = this)
        }
    }

    override fun onResume() {
        super.onResume()
        val pending = vm.getPendingDownloadId()
        if (pending > 0) {
            vm.onDownloadCompleted(pending)
        }
    }

    override fun onStart() {
        super.onStart()
        registerDownloadReceiver()
    }

    override fun onStop() {
        super.onStop()
        unregisterDownloadReceiver()
    }

    private fun registerDownloadReceiver() {
        if (downloadReceiver != null) return
        downloadReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                if (intent?.action != DownloadManager.ACTION_DOWNLOAD_COMPLETE) return
                val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L)
                if (id <= 0) return
                if (id == vm.getPendingDownloadId()) {
                    vm.onDownloadCompleted(id)
                }
            }
        }
        registerReceiver(downloadReceiver, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE))
    }

    private fun unregisterDownloadReceiver() {
        downloadReceiver?.let {
            unregisterReceiver(it)
        }
        downloadReceiver = null
    }
}
