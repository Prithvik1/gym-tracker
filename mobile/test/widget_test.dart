import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:gym_tracker/main.dart';

void main() {
  testWidgets('shows the login screen when no session is saved', (tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const GymTrackerApp());
    await tester.pumpAndSettle();

    expect(find.text('Log in'), findsWidgets);
  });
}
