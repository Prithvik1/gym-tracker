import 'dart:convert';
import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  ApiException(this.message);
  final String message;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({this.token});

  String? token;

  static String get _baseUrl {
    if (kIsWeb) return 'http://localhost:3000';
    // ponytail: Android emulator can't reach host localhost directly, needs
    // the 10.0.2.2 alias. Swap for a real API_BASE_URL --dart-define before
    // pointing at anything but a local backend.
    if (Platform.isAndroid) return 'http://10.0.2.2:3000';
    return 'http://localhost:3000';
  }

  Future<Map<String, dynamic>> signup({
    required String email,
    required String password,
    required String name,
  }) => _post('/auth/signup', {'email': email, 'password': password, 'name': name});

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) => _post('/auth/login', {'email': email, 'password': password});

  Future<Map<String, dynamic>> getMe() => _get('/users/me');

  Future<Map<String, dynamic>> setTrainingLevel(String level) =>
      _put('/users/me/training-level', {'training_level': level});

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (token != null) 'Authorization': 'Bearer $token',
  };

  Future<Map<String, dynamic>> _post(String path, Map<String, dynamic> body) async {
    final res = await http.post(
      Uri.parse('$_baseUrl$path'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> _put(String path, Map<String, dynamic> body) async {
    final res = await http.put(
      Uri.parse('$_baseUrl$path'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> _get(String path) async {
    final res = await http.get(Uri.parse('$_baseUrl$path'), headers: _headers);
    return _decode(res);
  }

  Map<String, dynamic> _decode(http.Response res) {
    final decoded = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400) {
      final message = decoded['message'];
      throw ApiException(
        message is List ? message.join(', ') : (message?.toString() ?? 'Request failed'),
      );
    }
    return decoded;
  }
}
