import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api_client.dart';
import 'screens/home_screen.dart';
import 'screens/training_level_screen.dart';

/// Persists [token], then replaces the whole nav stack with the screen
/// appropriate for whether onboarding (training level) is complete.
Future<void> routeAfterAuth(
  BuildContext context,
  ApiClient apiClient,
  String token,
  String? trainingLevel,
) async {
  apiClient.token = token;
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('access_token', token);
  if (!context.mounted) return;
  Navigator.of(context).pushAndRemoveUntil(
    MaterialPageRoute(
      builder: (_) => trainingLevel == null
          ? TrainingLevelScreen(apiClient: apiClient)
          : HomeScreen(apiClient: apiClient, trainingLevel: trainingLevel),
    ),
    (route) => false,
  );
}
