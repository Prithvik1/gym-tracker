import 'package:flutter/material.dart';

import '../api_client.dart';
import 'home_screen.dart';

class TrainingLevelScreen extends StatefulWidget {
  const TrainingLevelScreen({super.key, required this.apiClient});

  final ApiClient apiClient;

  @override
  State<TrainingLevelScreen> createState() => _TrainingLevelScreenState();
}

class _TrainingLevelScreenState extends State<TrainingLevelScreen> {
  static const _levels = ['beginner', 'intermediate', 'advanced'];

  bool _submitting = false;
  String? _error;

  Future<void> _select(String level) async {
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await widget.apiClient.setTrainingLevel(level);
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => HomeScreen(apiClient: widget.apiClient, trainingLevel: level),
        ),
      );
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Choose your level')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'How would you describe your training experience?',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 24),
            for (final level in _levels) ...[
              ElevatedButton(
                onPressed: _submitting ? null : () => _select(level),
                child: Text(level[0].toUpperCase() + level.substring(1)),
              ),
              const SizedBox(height: 12),
            ],
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: const TextStyle(color: Colors.red)),
            ],
          ],
        ),
      ),
    );
  }
}
