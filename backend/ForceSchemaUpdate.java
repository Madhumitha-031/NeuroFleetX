import java.sql.*;

public class ForceSchemaUpdate {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/neurofleetx_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        String user = "root";
        String pass = "root@123";
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            Statement stmt = conn.createStatement();
            System.out.println("Adding columns to agent_availability...");
            try {
                stmt.execute("ALTER TABLE agent_availability ADD COLUMN vehicle_model VARCHAR(255)");
                System.out.println("Added vehicle_model");
            } catch (SQLException e) {
                System.out.println("vehicle_model might already exist: " + e.getMessage());
            }

            try {
                stmt.execute("ALTER TABLE agent_availability ADD COLUMN vehicle_type VARCHAR(255)");
                System.out.println("Added vehicle_type");
            } catch (SQLException e) {
                System.out.println("vehicle_type might already exist: " + e.getMessage());
            }

            System.out.println("Schema update check complete.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
