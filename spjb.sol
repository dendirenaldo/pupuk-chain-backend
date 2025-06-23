// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SPJBContract
 * @dev Smart contract ini mengelola Surat Perjanjian Jual Beli (SPJB) untuk pupuk.
 * Kontrak ini memungkinkan pembuatan dan pengambilan data SPJB.
 */
contract SPJBContract {
    /**
     * @dev Struct untuk menyimpan detail realisasi bulanan.
     * @param fertilizerType Jenis pupuk yang direalisasikan.
     * @param quantity Jumlah (dalam Kg atau Ton) pupuk.
     * @param month Bulan realisasi (misal: "Januari", "Februari").
     */
    struct FertilizerSale {
        string fertilizerType;
        uint256 quantity;
        string month;
    }

    struct Approval {
        string name;
        string position;
        uint16 priority;
    }

    struct Region {
        string name;
        string[] subRegions;
    }

    /**
     * @dev Struct utama untuk menyimpan semua data SPJB.
     * @param spjbNumber Nomor unik dari SPJB.
     * @param distributorName Nama pihak distributor.
     * @param retailerName Nama pihak pengecer.
     * @param approvers Daftar nama yang mengesahkan perjanjian.
     * @param regions Daftar wilayah operasional pengecer.
     * @param monthlyRealisations Daftar data realisasi per bulan.
     * @param isExist Penanda untuk mengecek keberadaan SPJB.
     */
    struct SPJB {
        string spjbNumber;
        uint256 spjbYear;
        string distributorName;
        string retailerName;
        Approval[] approvers;
        Region[] regions;
        FertilizerSale[] fertilizerSales;
        bool isExist;
    }

    // Mapping untuk menyimpan SPJB dengan nomor SPJB sebagai key.
    // Dibuat private untuk kontrol akses melalui fungsi getter.
    mapping(string => SPJB) private spjbs;

    /**
     * @dev Event yang akan dipancarkan saat SPJB baru berhasil dibuat.
     * @param spjbNumber Nomor SPJB yang baru dibuat.
     * @param distributorName Nama distributor.
     * @param retailerName Nama pengecer.
     */
    event SPJBCreated(
        string spjbNumber,
        string distributorName,
        string retailerName
    );

    /**
     * @dev Fungsi untuk membuat SPJB baru.
     * @param _spjbNumber Nomor unik untuk SPJB baru.
     * @param _distributorName Nama distributor.
     * @param _retailerName Nama pengecer.
     * @param _approvers Daftar nama yang mengesahkan.
     * @param _regions Daftar wilayah pengecer.
     * @param _realisations Daftar realisasi bulanan untuk SPJB ini.
     */
    function createSPJB(
        string memory _spjbNumber,
        uint256 _spjbYear,
        string memory _distributorName,
        string memory _retailerName,
        Approval[] memory _approvers,
        Region[] memory _regions,
        FertilizerSale[] memory _realisations
    ) public {
        // Memastikan SPJB dengan nomor yang sama belum pernah dibuat sebelumnya.
        require(
            !spjbs[_spjbNumber].isExist,
            'SPJB dengan nomor ini sudah ada.'
        );
        require(
            bytes(_spjbNumber).length > 0,
            'Nomor SPJB tidak boleh kosong.'
        );

        // Menyimpan SPJB baru ke dalam mapping.
        spjbs[_spjbNumber] = SPJB({
            spjbNumber: _spjbNumber,
            spjbYear: _spjbYear,
            distributorName: _distributorName,
            retailerName: _retailerName,
            approvers: _approvers,
            regions: _regions,
            fertilizerSales: _realisations,
            isExist: true
        });

        // Memancarkan event sebagai notifikasi bahwa SPJB baru telah dibuat.
        emit SPJBCreated(_spjbNumber, _distributorName, _retailerName);
    }

    /**
     * @dev Fungsi untuk mengambil detail lengkap dari sebuah SPJB berdasarkan nomornya.
     * @param _spjbNumber Nomor SPJB yang ingin dicari.
     * @return Mengembalikan semua data yang tersimpan dalam struct SPJB.
     */
    function getSPJB(
        string memory _spjbNumber
    ) public view returns (SPJB memory) {
        // Memastikan SPJB yang dicari ada dalam mapping.
        require(
            spjbs[_spjbNumber].isExist,
            'SPJB dengan nomor ini tidak ditemukan.'
        );

        // Mengembalikan data SPJB dari storage.
        return spjbs[_spjbNumber];
    }

    /**
     * @dev Fungsi untuk mengambil detail realisasi bulanan dari sebuah SPJB.
     * Ini adalah contoh fungsi getter spesifik jika Anda hanya butuh data realisasi.
     * @param _spjbNumber Nomor SPJB yang ingin dicari.
     * @return Mengembalikan array dari struct FertilizerSale.
     */
    function getFertilizerSales(
        string memory _spjbNumber
    ) public view returns (FertilizerSale[] memory) {
        // Memastikan SPJB yang dicari ada dalam mapping.
        require(
            spjbs[_spjbNumber].isExist,
            'SPJB dengan nomor ini tidak ditemukan.'
        );

        return spjbs[_spjbNumber].fertilizerSales;
    }

    function getRegions(
        string memory _spjbNumber
    ) public view returns (Region[] memory) {
        require(
            spjbs[_spjbNumber].isExist,
            'SPJB dengan nomor ini tidak ditemukan.'
        );

        return spjbs[_spjbNumber].regions;
    }
}
