import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api_client.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/training_level_screen.dart';

void main() {
  runApp(const GymTrackerApp());
}

class GymTrackerApp extends StatelessWidget {
  const GymTrackerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gym Tracker',
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple)),
      home: const AuthGate(),
    );
  }
}

/// Restores a saved session on launch, otherwise starts at login.
class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  final _apiClient = ApiClient();
  Widget? _resolvedScreen;

  @override
  void initState() {
    super.initState();
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');
    if (token == null) {
      setState(() => _resolvedScreen = LoginScreen(apiClient: _apiClient));
      return;
    }
    _apiClient.token = token;
    try {
      final user = await _apiClient.getMe();
      final trainingLevel = user['training_level'] as String?;
      setState(() {
        _resolvedScreen = trainingLevel == null
            ? TrainingLevelScreen(apiClient: _apiClient)
            : HomeScreen(apiClient: _apiClient, trainingLevel: trainingLevel);
      });
    } on ApiException {
      await prefs.remove('access_token');
      _apiClient.token = null;
      setState(() => _resolvedScreen = LoginScreen(apiClient: _apiClient));
    }
  }

  @override
  Widget build(BuildContext context) {
    final screen = _resolvedScreen;
    if (screen == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return screen;
  }
}
