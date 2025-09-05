// Backend/src/routes/userRoutes.ts'ye eklenecek endpoint

// PATCH /api/users/upgrade-to-corporate
export const upgradeToCorporate = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { company_name } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Yetkisiz işlem' 
      });
    }

    if (!company_name || company_name.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Şirket adı en az 2 karakter olmalıdır' 
      });
    }

    // Kullanıcıyı kurumsal hesaba yükselt
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        is_corporate: true,
        company_name: company_name.trim(),
        role: 'CORPORATE',
        updated_at: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Hesabınız başarıyla kurumsal hesaba yükseltildi.',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          is_corporate: updatedUser.is_corporate,
          company_name: updatedUser.company_name,
          role: updatedUser.role
        }
      }
    });

  } catch (error) {
    console.error('Corporate upgrade error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Hesap yükseltme işlemi sırasında bir hata oluştu' 
    });
  }
};
