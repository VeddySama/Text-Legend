package com.textlegend.app

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument

@Composable
fun TextLegendApp() {
    val navController = rememberNavController()
    val vm: GameViewModel = viewModel()

    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            NavHost(navController = navController, startDestination = "boot") {
                composable("boot") {
                    LaunchedEffect(Unit) {
                        val route = if (vm.hasServerConfig()) {
                            if (vm.hasToken()) "auth" else "auth"
                        } else {
                            "server"
                        }
                        navController.navigate(route) { popUpTo("boot") { inclusive = true } }
                    }
                }
                composable("server") {
                    ServerScreen(
                        initialUrl = vm.getServerUrl(),
                        onSave = { url ->
                            vm.setServerUrl(url)
                            navController.navigate("auth") { popUpTo("server") { inclusive = true } }
                        }
                    )
                }
                composable("auth") {
                    AuthScreen(
                        vm = vm,
                        onServerClick = { navController.navigate("server") },
                        onAuthed = { navController.navigate("characters") { popUpTo("auth") { inclusive = true } } }
                    )
                }
                composable("characters") {
                    CharacterScreen(
                        vm = vm,
                        onEnter = { name ->
                            vm.connectSocket(name)
                            navController.navigate("game/${name}")
                        },
                        onLogout = {
                            vm.logout()
                            navController.navigate("auth") { popUpTo("characters") { inclusive = true } }
                        }
                    )
                }
                composable(
                    route = "game/{name}",
                    arguments = listOf(navArgument("name") { type = NavType.StringType })
                ) {
                    GameScreen(
                        vm = vm,
                        onExit = {
                            vm.disconnectSocket()
                            navController.navigate("characters") { popUpTo("game/{name}") { inclusive = true } }
                        }
                    )
                }
            }
        }
    }
}
