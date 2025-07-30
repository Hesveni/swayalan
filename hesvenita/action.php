<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
header('Content-Type: application/json; charset=UTF-8');

include "db_config.php"; // Koneksi database (PDO)

$data = [];
$postjson = null;
$aksi = null;

// Deteksi request POST atau GET
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!empty($_POST['aksi'])) {
        $aksi = $_POST['aksi'];
    } else {
        $postjson = json_decode(file_get_contents('php://input'), true);
        $aksi = $postjson['aksi'] ?? null;
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $aksi = $_GET['aksi'] ?? null;
}

// Validasi aksi
if (!$aksi) {
    echo json_encode(['success' => false, 'msg' => 'Aksi tidak dikirim']);
    exit;
}

// Fungsi buat kode pembelian otomatis
function generateKodePembelian($pdo) {
    $today = date('Ymd');
    $prefix = 'PB' . $today;
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM pembelian WHERE kode_pembelian LIKE :prefix");
    $stmt->execute([':prefix' => "$prefix%"]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $nextNumber = $row['total'] + 1;
    return $prefix . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
}

switch ($aksi) {

    // ✅ Tambah Pembelian (JSON)
    case "add_pembelian":
    try {
        // Validasi manual data kosong
        $requiredFields = ['tanggal', 'nama_produk', 'kode_produk', 'harga_beli', 'jumlah', 'metode_pembayaran'];
        foreach ($requiredFields as $field) {
            if (empty($postjson[$field])) {
                echo json_encode(['success' => false, 'msg' => 'Field "' . $field . '" tidak boleh kosong']);
                exit;
            }
        }

        $kodePembelian = generateKodePembelian($pdo);

        $stmt = $pdo->prepare("INSERT INTO pembelian (kode_pembelian, tanggal, nama_produk, kode_produk, harga_beli, jumlah, total_harga, metode_pembayaran, keterangan)
                               VALUES (:kode_pembelian, :tanggal, :nama_produk, :kode_produk, :harga_beli, :jumlah, :total_harga, :metode_pembayaran, :keterangan)");

        $stmt->execute([
            ':kode_pembelian'     => $kodePembelian,
            ':tanggal'            => $postjson['tanggal'],
            ':nama_produk'        => $postjson['nama_produk'],
            ':kode_produk'        => $postjson['kode_produk'],
            ':harga_beli'         => $postjson['harga_beli'],
            ':jumlah'             => $postjson['jumlah'],
            ':total_harga'        => $postjson['harga_beli'] * $postjson['jumlah'],
            ':metode_pembayaran'  => $postjson['metode_pembayaran'],
            ':keterangan'         => $postjson['keterangan'] ?? ''
        ]);

        echo json_encode(['success' => true, 'msg' => 'Pembelian berhasil disimpan', 'kode' => $kodePembelian]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'msg' => $e->getMessage()]);
    }
    break;


    // ✅ Tambah Produk (FormData)
    case "add_produk":
        try {
            $namaproduk = $_POST['namaproduk'] ?? '';
            $kodeproduk = $_POST['kodeproduk'] ?? '';
            $harga      = $_POST['harga'] ?? 0;
            $kategori   = $_POST['kategori'] ?? '';
            $stock      = $_POST['stock'] ?? 0;
            $gambar     = '';

            // Proses upload gambar
            if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === 0) {
                $ext = pathinfo($_FILES['gambar']['name'], PATHINFO_EXTENSION);
                $filename = uniqid('img_') . '.' . $ext;
                $uploadPath = 'uploads/' . $filename;

                if (!is_dir('uploads')) {
                    mkdir('uploads', 0777, true);
                }

                if (move_uploaded_file($_FILES['gambar']['tmp_name'], $uploadPath)) {
                    $gambar = $filename;
                } else {
                    echo json_encode(['success' => false, 'msg' => 'Upload gambar gagal']);
                    exit;
                }
            }

            $stmt = $pdo->prepare("INSERT INTO produk (namaproduk, kodeproduk, harga, kategori, stock, gambar)
                                   VALUES (:namaproduk, :kodeproduk, :harga, :kategori, :stock, :gambar)");
            $stmt->execute([
                ':namaproduk' => $namaproduk,
                ':kodeproduk' => $kodeproduk,
                ':harga'      => $harga,
                ':kategori'   => $kategori,
                ':stock'      => $stock,
                ':gambar'     => $gambar
            ]);

            echo json_encode(['success' => true, 'msg' => 'Produk berhasil ditambahkan!']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'msg' => $e->getMessage()]);
        }
        break;

    // ✅ Ambil Data Pembelian
    case "get_pembelian":
        try {
            $stmt = $pdo->query("SELECT * FROM pembelian ORDER BY id DESC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'result' => $data]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'msg' => $e->getMessage()]);
        }
        break;

    // ✅ Ambil Data Produk
    case "get_produk":
        try {
            $stmt = $pdo->query("SELECT * FROM produk ORDER BY id DESC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'result' => $data]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'msg' => $e->getMessage()]);
        }
        break;

    // ✅ Login Admin
    case "login_admin":
        try {
            $username = $postjson['username'] ?? '';
            $password = $postjson['password'] ?? '';

            $stmt = $pdo->prepare("SELECT * FROM admin WHERE username = :username AND password = :password");
            $stmt->execute([
                ':username' => $username,
                ':password' => $password
            ]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Login berhasil']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Username atau password salah']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'msg' => $e->getMessage()]);
        }
        break;

    // ❌ Default
    default:
        echo json_encode(['success' => false, 'msg' => 'Aksi tidak dikenali']);
        break;
}
